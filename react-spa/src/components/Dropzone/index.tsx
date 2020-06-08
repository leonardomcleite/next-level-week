import React, {useCallback, useState} from 'react'
import { useDropzone } from 'react-dropzone'
import './styles.css'
import { FiUpload } from 'react-icons/fi'

interface Props {
  onFileUploaded:(file: File) => void
}

const Dropzone: React.FC<Props> = ({onFileUploaded}) => {

  const [fileUrl, setFileUrl] = useState('')

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const fileUri = URL.createObjectURL(file)
    setFileUrl(fileUri)
    onFileUploaded(file)
  }, [onFileUploaded])
  const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept: 'image/*'
  })

  return (
    <div className="dropzone" {...getRootProps()}>
      <input accept="image/*" {...getInputProps()} />
      {(
        fileUrl ? <img src={fileUrl} alt="Point image"/> 
        : <p>
            <FiUpload/>
            Imagem do estabelecimento
          </p>
      )}
      
    </div>
  )
}

export default Dropzone