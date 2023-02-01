import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import "./userWorker";

function CommonDiffEditor(props: { original: string; modified: string }) {
  const { original, modified } = props;

  const editorRef = useRef<monaco.editor.IDiffEditor | null>();

  const monacoEl = useRef(null);

  useEffect(() => {
    if (monacoEl && !editorRef.current) {
      editorRef.current = monaco.editor.createDiffEditor(monacoEl.current!, {
        readOnly: true,
        automaticLayout: true,
        minimap: {
          enabled: false,
        },
        renderOverviewRuler: false,
        fontSize: 14,
        scrollBeyondLastLine: false,
      });

      editorRef.current.setModel({
        original: monaco.editor.createModel(original, "typescript"),
        modified: monaco.editor.createModel(modified, "typescript"),
      });
    }

    return () => {};
  }, [modified, original]);

  return <div className=" border-t" style={{ height: "70vh", width: "100%" }} ref={monacoEl}></div>;
}

export default CommonDiffEditor;
