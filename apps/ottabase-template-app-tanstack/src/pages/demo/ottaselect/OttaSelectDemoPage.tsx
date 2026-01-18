/**
 * OttaSelect Demo Page
 * Demonstrates @ottabase/ottaselect component
 */
import { OttaSelect, type OttaSelectItem } from "@ottabase/ottaselect";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ottabase/ui-shadcn";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

// Sample data with various formats
const fruitsAndVegetables = [
  { id: "1", name: "Apple", category: "Fruit", color: "Red", price: 2.99 },
  { id: "2", name: "Banana", category: "Fruit", color: "Yellow", price: 1.99 },
  {
    id: "3",
    name: "Carrot",
    category: "Vegetable",
    color: "Orange",
    price: 0.99,
  },
  { id: "4", name: "Durian", category: "Fruit", color: "Green", price: 12.99 },
  {
    id: "5",
    name: "Eggplant",
    category: "Vegetable",
    color: "Purple",
    price: 3.49,
  },
  { id: "6", name: "Fig", category: "Fruit", color: "Purple", price: 4.99 },
  { id: "7", name: "Grapes", category: "Fruit", color: "Green", price: 3.99 },
  { id: "8", name: "Honeydew", category: "Fruit", color: "Green", price: 5.49 },
];

const countries = [
  { id: "us", label: "United States", code: "US", population: 331000000 },
  { id: "uk", label: "United Kingdom", code: "GB", population: 67000000 },
  { id: "jp", label: "Japan", code: "JP", population: 126000000 },
  { id: "de", label: "Germany", code: "DE", population: 83000000 },
  { id: "fr", label: "France", code: "FR", population: 67000000 },
  { id: "in", label: "India", code: "IN", population: 1400000000 },
];

const users = [
  { id: "u1", title: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "u2", title: "Jane Smith", email: "jane@example.com", role: "Editor" },
  { id: "u3", title: "Bob Wilson", email: "bob@example.com", role: "Viewer" },
  {
    id: "u4",
    title: "Alice Brown",
    email: "alice@example.com",
    role: "Editor",
  },
];

export function OttaSelectDemoPage() {
  // Single select states
  const [singleFruit, setSingleFruit] = useState<OttaSelectItem | null>(null);
  const [singleCountry, setSingleCountry] = useState<OttaSelectItem | null>(
    null,
  );
  const [singleUser, setSingleUser] = useState<OttaSelectItem | null>(null);

  // Multi select states
  const [multiFruits, setMultiFruits] = useState<OttaSelectItem[] | null>(null);
  const [multiCountries, setMultiCountries] = useState<OttaSelectItem[] | null>(
    null,
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Button
          asChild
          variant="ghost"
          className="w-fit text-muted-foreground hover:text-foreground"
        >
          <Link to="/demo">← Back to Demo Gallery</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="uppercase">
            @ottabase/ottaselect
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            OttaSelect Component
          </h1>
        </div>
        <p className="max-w-3xl text-muted-foreground">
          A flexible select component with standardized output. Accepts any
          object format with <code className="bg-muted px-1 rounded">id</code>{" "}
          and
          <code className="bg-muted px-1 rounded">name</code>/
          <code className="bg-muted px-1 rounded">label</code>/
          <code className="bg-muted px-1 rounded">title</code> properties.
        </p>
      </div>

      {/* Single Select Examples */}
      <Card>
        <CardHeader>
          <CardTitle>🔘 Single Select</CardTitle>
          <CardDescription>
            Select one item from a list. Works with various data formats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* With name property */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Objects with{" "}
              <code className="bg-muted px-1 rounded text-xs">name</code>{" "}
              property:
            </label>
            <OttaSelect
              mode="single"
              items={fruitsAndVegetables}
              value={singleFruit}
              onChange={(value) =>
                setSingleFruit(value as OttaSelectItem | null)
              }
              placeholder="Select a fruit or vegetable..."
            />
            {singleFruit && (
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(singleFruit, null, 2)}
              </pre>
            )}
          </div>

          {/* With label property */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Objects with{" "}
              <code className="bg-muted px-1 rounded text-xs">label</code>{" "}
              property:
            </label>
            <OttaSelect
              mode="single"
              items={countries}
              value={singleCountry}
              onChange={(value) =>
                setSingleCountry(value as OttaSelectItem | null)
              }
              placeholder="Select a country..."
            />
            {singleCountry && (
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(singleCountry, null, 2)}
              </pre>
            )}
          </div>

          {/* With title property */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Objects with{" "}
              <code className="bg-muted px-1 rounded text-xs">title</code>{" "}
              property:
            </label>
            <OttaSelect
              mode="single"
              items={users}
              value={singleUser}
              onChange={(value) =>
                setSingleUser(value as OttaSelectItem | null)
              }
              placeholder="Select a user..."
            />
            {singleUser && (
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(singleUser, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Multi Select Examples */}
      <Card>
        <CardHeader>
          <CardTitle>☑️ Multi Select</CardTitle>
          <CardDescription>Select multiple items from a list.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Multi select fruits */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select multiple fruits:
            </label>
            <OttaSelect
              mode="multiple"
              items={fruitsAndVegetables}
              value={multiFruits}
              onChange={(value) =>
                setMultiFruits(value as OttaSelectItem[] | null)
              }
              placeholder="Select fruits and vegetables..."
            />
            {multiFruits && multiFruits.length > 0 && (
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto max-h-48">
                {JSON.stringify(multiFruits, null, 2)}
              </pre>
            )}
          </div>

          {/* Multi select countries */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select multiple countries:
            </label>
            <OttaSelect
              mode="multiple"
              items={countries}
              value={multiCountries}
              onChange={(value) =>
                setMultiCountries(value as OttaSelectItem[] | null)
              }
              placeholder="Select countries..."
            />
            {multiCountries && multiCountries.length > 0 && (
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto max-h-48">
                {JSON.stringify(multiCountries, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Features</CardTitle>
          <CardDescription>Key capabilities of OttaSelect</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Flexible Input:</strong> Accepts objects with{" "}
                <code className="bg-muted px-1 rounded">name</code>,{" "}
                <code className="bg-muted px-1 rounded">label</code>, or{" "}
                <code className="bg-muted px-1 rounded">title</code> properties
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Standardized Output:</strong> Always returns{" "}
                <code className="bg-muted px-1 rounded">OttaSelectItem</code>{" "}
                with consistent shape
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Single & Multi Mode:</strong> Toggle between selecting
                one or multiple items
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Searchable:</strong> Built-in search/filter
                functionality
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Preserves Data:</strong> Original object properties are
                preserved in output
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Usage</CardTitle>
          <CardDescription>How to use OttaSelect in your app</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            {`import { OttaSelect, type OttaSelectItem } from "@ottabase/ottaselect";
import { useState } from "react";

// Your data (any format with id + name/label/title)
const items = [
  { id: "1", name: "Apple", color: "Red" },
  { id: "2", name: "Banana", color: "Yellow" },
];

function MyComponent() {
  const [selected, setSelected] = useState<OttaSelectItem | null>(null);

  return (
    <OttaSelect
      mode="single"          // or "multiple"
      items={items}
      value={selected}
      onChange={(value) => setSelected(value as OttaSelectItem | null)}
      placeholder="Select an item..."
    />
  );
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
