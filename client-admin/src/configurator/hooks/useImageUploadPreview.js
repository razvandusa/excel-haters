import { useEffect, useState } from 'react'

export default function useImageUploadPreview() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [uploadedImageName, setUploadedImageName] = useState('')

  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl)
      }
    }
  }, [uploadedImageUrl])

  function handleImageUpload(event) {
    const [file] = event.target.files || []

    if (!file) {
      return
    }

    const nextImageUrl = URL.createObjectURL(file)

    setUploadedImageUrl((currentImageUrl) => {
      if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl)
      }

      return nextImageUrl
    })
    setUploadedImageName(file.name)
  }

  return {
    uploadedImageName,
    uploadedImageUrl,
    handleImageUpload,
  }
}
