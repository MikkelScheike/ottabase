import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { describe, expect, it } from 'vitest';
import { BaseModel } from '../BaseModel';

const castTable = sqliteTable('cast_test', {
    id: text('id').primaryKey(),
    score: integer('score'), // 'number' cast
    tags: text('tags'), // 'json' cast on a plain TEXT column → serialize on write
    csv: text('csv'), // 'array' cast
    jsonCol: text('json_col', { mode: 'json' }), // 'json' cast on a json-mode column → leave to Drizzle
});

class CastModel extends BaseModel {
    static entity = 'cast_test';
    static table = castTable;
    static primaryKey = 'id';
    static casts = {
        score: 'number' as const,
        tags: 'json' as const,
        csv: 'array' as const,
        jsonCol: 'json' as const,
    };

    static prepare(data: Record<string, any>) {
        return this.prepareForDatabase(data);
    }

    castValue(key: string, value: unknown) {
        return this.castAttributeValue(key, value);
    }
}

describe('type casting', () => {
    const instance = new CastModel({ entity: 'cast_test', data: {} } as any);

    describe('castAttributeValue (read side)', () => {
        it("'number' cast preserves decimals (parseFloat, not parseInt)", () => {
            expect(instance.castValue('score', '3.5')).toBe(3.5);
            expect(instance.castValue('score', '10')).toBe(10);
        });

        it("'array' cast parses JSON arrays", () => {
            expect(instance.castValue('csv', '["a","b"]')).toEqual(['a', 'b']);
        });

        it("'array' cast falls back to CSV for non-JSON strings", () => {
            expect(instance.castValue('csv', 'a, b, c')).toEqual(['a', 'b', 'c']);
        });

        it("'array' cast returns [] for empty string", () => {
            expect(instance.castValue('csv', '')).toEqual([]);
        });
    });

    describe('prepareForDatabase (write side)', () => {
        it('serializes json/array casts on plain TEXT columns', () => {
            const prepared = CastModel.prepare({ tags: { a: 1 }, csv: ['x', 'y'] });
            expect(prepared.tags).toBe('{"a":1}');
            expect(prepared.csv).toBe('["x","y"]');
        });

        it('leaves Drizzle mode:json columns untouched (no double-encoding)', () => {
            const prepared = CastModel.prepare({ jsonCol: { b: 2 } });
            expect(prepared.jsonCol).toEqual({ b: 2 });
        });

        it('does not re-stringify a value that is already a string', () => {
            const prepared = CastModel.prepare({ tags: '{"already":"string"}' });
            expect(prepared.tags).toBe('{"already":"string"}');
        });
    });
});
