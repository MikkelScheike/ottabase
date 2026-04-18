import { sanitizeInlineHtml } from '@ottabase/utils/sanitize';
import { RenderFn } from 'editorjs-blocks-react-renderer';
import './List.css';

const List: RenderFn<{ items: any[]; style: string }> = ({ data, className = '', level = 1 }) => {
    const ListTag: 'ol' | 'ul' = data.style === 'ordered' ? 'ol' : 'ul';

    return (
        <>
            <ListTag className={`${className} cdc-content-list-${ListTag}`}>
                {data?.items?.map((item, i) => {
                    return (
                        <li
                            key={i}
                            className={`cdc-content-list cdc-content-list-l${level} text-foreground text-base/7`}
                        >
                            {/* EditorJS list items often include inline HTML (e.g. <strong>) */}
                            <span dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(item.content ?? '') }} />
                            {item.items.length > 0 && <List data={item} level={level + 1} />}
                        </li>
                    );
                })}
            </ListTag>
        </>
    );
};

export default List;
