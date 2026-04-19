
import React, { useState, useMemo } from 'react'
import { Box, Button, Typography } from '@mui/material'
import UploadFileOutlined  from '@mui/icons-material/UploadFileOutlined'
import { AlertCollapse } from './AlertCollapse';


interface IProps{
    multi?:         boolean;
    type?:          'all' | UploadFileType[];
    sizeFormatMax?: UploadFilteSizeFormatMaxType;
    isRequired?:    boolean;
    sizeMax?:       number;
    dimension?:     {
        start:      number;
        end:        number;
    };
    img?:           string;
    onChangeFile: (files: File[]) => void;
}

export type UploadFileType = keyof ITypeFileFormat;
export type UploadFilteSizeFormatMaxType = 'MB' | 'KB';

interface IErrFile{
    type:       'err-format' | 'err-size';
    filesName:     string[];
}

export const UploadFileAndPreview = ({
    type = 'all',
    sizeFormatMax = 'MB',
    isRequired = false,
    multi = false,
    sizeMax,
    dimension,
    img,
    onChangeFile
}: IProps) => {
    const [files, setFiles] = useState<File[]>([]);
    const [err, setErr] = useState<string[]>([]);
    const [imgPreview, setImgPreview] = useState<string | undefined>(img);

    const typeFormat = useMemo(() => {
        if( type !== 'all' ){
            let stringType = '';
            let valueNotRepeat: string[] = [];

            type.map((value) => {
                if( !valueNotRepeat.includes(value) ){
                    valueNotRepeat.push(value);
                }
            });

            valueNotRepeat.map((value, idx) => {
                if( idx == valueNotRepeat.length - 1  ){
                    stringType = stringType+' ó '+value
                }else{
                    stringType = idx == 0 ? value : stringType+', '+value
                }
            })

            return stringType;
        }

        return 'Cualquier archivo'
    }, [type]);

    const typeAcceptInput = useMemo(() => {
        if( type !== 'all' ){
            let arrType: string[] = [];

            type.map((value) => arrType.push(typeFileFormat[value]));

            return arrType.join(',')
        }

    }, [type])

    const getFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const files = e.target.files;

        if( files ){
            setErr([]);
            setImgPreview(undefined);
            setFiles([]);
            const filesUpload = validFile(files);

            if( filesUpload.length > 0 ){
                setImgPreview(URL.createObjectURL(filesUpload[0]));
                onChangeFile(filesUpload);
                setFiles(filesUpload);
            }
        }
        //console.log(e.target.files)
    }

    const validFile = (files: FileList) => {
        const { filesSuccess, errFormat } = validTypeFormat(files);
        
        if( errFormat.length > 0 ){
            setErr([...errFormat])
        }

        let auxFileSuccess: File[] = [];
        let errSize: string[] = [];

        filesSuccess.map((file) => {
            if( validSizeFile(file) ){
                auxFileSuccess.push(file)
            }else{
                errSize.push(`Tamaño excedido,${file.name}`);
            }
        });

        if( errSize.length > 0 ) {
            setErr(values => ([...values, ...errSize]))
        }

        return auxFileSuccess;
    }

    const validTypeFormat = (files: FileList) => {
        let filesSuccess: File[] = [];
        let errFormat: string[] = [];
        
        for (let i = 0; i < files.length; i++) {
            let errFormatFile:string = '';
            let file: File | null = files[i];

            if( type !== 'all' ){
                type.some((value) => {
                    const format = typeFileFormat[value];
                    
    
                    if( format ){
                        if( files[i].type !== format ){
                            errFormatFile = `Formato invalido,${files[i].name}`;
                            file = null;
                        }else{
                            errFormatFile = '';
                            file = files[i];
                            return true;
                        }
                    }
                });

            }

            if( errFormatFile !== '' ) errFormat.push(errFormatFile);
            if( file ) filesSuccess.push(file);
        }

        return { filesSuccess, errFormat };
    }

    const validSizeFile = (file: File) => {
        if( sizeMax ){
            const sizeMaxFile =  sizeFormatMax == 'MB' ? sizeMax * 1024  : sizeMax;

            if( file.size > sizeMaxFile * 1024 ){
                return false;
            }

            return true;
        }
        
        return true;
    }


    return (
        <div>
            <Box
                sx={{
                    padding: '4px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed lightgray',
                    borderRadius: 1,
                    minHeight: '150px',
                    maxHeight: '230px'
                }}
                mb={err.length > 0 ? 2 : 0}
            >
                <Box p={1.5} position={imgPreview ? 'absolute' : 'relative'} display='flex' flexDirection='column' alignItems='center' justifyContent='center' bgcolor='rgb(255 255 255 / 90%)' borderRadius={1}
                    sx={{
                        opacity: imgPreview ? 0 : 1,
                        transition: '0.7s',
                        ':hover': {
                            opacity: 1
                        }
                    }}
                >
                    <UploadFileOutlined color='info' />
                    <Button 
                    variant='text'
                    color='info'
                    type='button'
                    sx={{
                        padding: '8px 12px',
                        lineHeight: 1,
                        my: 1,
                        textTransform: 'capitalize',
                        position: 'relative'
                    }}
                    >
                    <input 
                        className="input-file_styleButton" 
                        type="file" 
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                        }}
                        onChange={getFile}
                        multiple={multi}
                        required={isRequired}
                        accept={typeAcceptInput}
                    />
                    Haga clic para cargar
                    </Button>
                    <Typography mb={dimension ? 0.5 : 0} variant='body2' color='grey'>{typeFormat} {sizeMax && `(Max ${sizeMax}${sizeFormatMax})`}</Typography>
                    {
                        dimension &&
                        <Typography variant='caption' color='grey'>Dimensión: <strong>{dimension.start} × {dimension.end} px</strong></Typography>
                    }
                </Box>
                {
                    imgPreview &&
                    <Box minHeight='150px' maxHeight='230px'>
                        <img src={imgPreview} style={{
                            minHeight: '150px',
                            maxHeight: '200px',
                            maxWidth: '100%',
                            objectFit: 'cover',
                            borderRadius: '6px'
                        }}/>
                    </Box>
                }
                {
                    imgPreview  &&
                    <Box fontSize={'12px'} position='absolute' color='white' bgcolor='#0288d1' right={12} top={12} p={'1px 6px'} borderRadius={5} >
                        { files.length > 0 ? files.length : 1}
                    </Box>
                }
            </Box>
            {
                err.map((value, idx) => {
                    const arrValue = value.split(',');
                    return (
                        <Box my={1} key={idx}>
                            <AlertCollapse 
                                show={true}
                                typeAlert='error'
                                showIcon={true}
                                showTitle={{
                                    show: true,
                                    title: arrValue[0]
                                }}
                                description={arrValue[1]}
                                aletProps={{
                                    variant: 'outlined'
                                }}
                            />
                        </Box>
                    )
                })
                }
        </div>
    )
}

interface ITypeFileFormat {
    png:    string;
    gif:    string;
    jpg:    string;
    jpeg:   string;
    svg:    string;
    webp:   string;
    tiff:   string;
}

const typeFileFormat: ITypeFileFormat = {
    png:    'image/png',
    gif:    'image/gif',
    jpg:    'image/jpeg',
    jpeg:   'image/jpeg',
    svg:    'image/svg+xml',
    webp:   'image/webp',
    tiff:   'image/tiff'
}
