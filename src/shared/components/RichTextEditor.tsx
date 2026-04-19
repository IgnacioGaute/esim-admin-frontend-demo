import { useEffect, useRef, useState } from 'react'
import { Box, Button } from '@mui/material';
import { DeleteOutlined, SaveOutlined } from '@mui/icons-material';
import { AlertCollapse } from './AlertCollapse';
import { BoxLoading } from './BoxLoading';

let rte: IMethodAndPropertyEditor | undefined;

export const RichTextEditor = ({
    value,
    onValueEditor,
    configEditor,
    height = '480px',
    showTrash = false,
    isRequired = false,
    loading = false
}: IProps) => {
    const [msgErr, setMsgErr] = useState<string | undefined>();
    const refdiv = useRef(null);

    useEffect(() => {
        rte = new window.RichTextEditor(refdiv.current, {
            enableDragDrop: false,
            showFloatParagraph: false,
            showPlusButton: false,
            showStatistics: false,
            editorResizeMode: 'height',
            tabSpaces: 2,
            ...configEditor
        });

    }, [])

    useEffect(() => {
        if( value && rte ) rte.setHTMLCode(value);
    }, [value, rte])
    
    
    const onSaved = () => {
        const valueNew = rte?.getHTMLCode();

        if( isRequired && (!valueNew || valueNew == '')){
            setMsgErr('El campo de texto es obligatorio');
            return;
        }

        if( valueNew ) onValueEditor(valueNew);
    }

    return (
        <Box position='relative' width='100%'>
            <div ref={refdiv} style={{maxHeight: height}}></div>
            <Box mt={msgErr ? 2 : 0}>
                <AlertCollapse 
                    typeAlert='error'
                    show={msgErr !== undefined}
                    onClosed={() => setMsgErr(undefined)}
                    description={msgErr || ''}
                />
            </Box>
            <Box py={2} display='flex' width='100%' alignItems='center' flexDirection='row'>
                <Button
                    variant='contained'
                    color='primary'
                    startIcon={<SaveOutlined />}
                    sx={{ mr: 1.5 }}
                    onClick={onSaved}
                    disableElevation
                >
                    Guardar
                </Button>
                {
                    showTrash && rte?.getHTMLCode() &&
                    <Button
                        variant='outlined'
                        color='secondary'
                        startIcon={<DeleteOutlined />}
                        sx={{ mr: 1.5 }}
                       
                        disableElevation
                    >
                        Limpiar
                    </Button>
                }
            </Box>
            <BoxLoading
                isLoading={loading}
                showGif
                position='absolute'
            />
        </Box>
    )
}


declare global {
    interface Window {
      RichTextEditor: new (value: any, props?: IConfigPropsEditor) => IMethodAndPropertyEditor;
    }
}

interface IProps{
    value?:         string;
    onValueEditor:  (value: string) => void;
    configEditor?:  IConfigPropsEditor & any;
    height?:        string;
    showTrash?:     boolean;
    isRequired?:    boolean;
    loading?:       boolean;
}

interface IMethodAndPropertyEditor {
    setHTMLCode: (value: any) => void;
    getHTMLCode: () => string;
    execCommand: (cmd: TypeItemBarEditor, value: any) => void;
}

interface IConfigPropsEditor{
    toolbar?:               'default' | 'basic' | 'full' | string;
    enableDragDrop?:        boolean;
    readOnly?:              boolean;
    maxHTMLLength?:         -1 | number;
    maxTextLength?:         -1 | number;
    showFloatParagraph?:    boolean;
    showPlusButton?:        boolean;
    showTagList?:           boolean;
    showStatistics?:        boolean;
    editorResizeMode?:      'both' | 'height' | ' none';
    tabSpaces?:             number;
}

type TypeItemBarEditor = 'bold' | 'italic' | 'fontsize' | 'forecolor' | 'backcolor' 
| 'justifyleft' | 'justifycenter' | 'justifyright' | 'justifyfull' | 'indent' | 'outdent' | 'insertorderedlist' 
| 'insertunorderedlist' | 'undo' | 'redo' | 'fullscreenenter' | 'fullscreenexit';