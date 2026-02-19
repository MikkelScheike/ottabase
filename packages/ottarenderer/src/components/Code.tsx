import { RenderFn } from 'editorjs-blocks-react-renderer';
import { CodeBlock } from '@ottabase/ui-code-highlight';

const Code: RenderFn<{ code: string; language?: string }> = ({ data }) => {
    const { code, language = 'plaintext' } = data;
    return (
        <div className="cdc-content-code my-4">
            <CodeBlock
                code={code}
                language={language || 'plaintext'}
                filename={undefined}
                className="cdc-content-code-block"
            />
        </div>
    );
};

export default Code;
