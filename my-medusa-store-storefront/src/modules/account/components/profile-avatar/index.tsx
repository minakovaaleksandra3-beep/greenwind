"use client"


import React, { useRef, useState, useEffect } from "react"


type Props = {
  initials: string
  email: string
}


const ProfileAvatar: React.FC<Props> = ({ initials, email }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)


  useEffect(() => {
    fetch(`/api/account/avatar?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl)
      })
      .catch(() => {})
  }, [email])


  const handleClick = () => {
    inputRef.current?.click()
  }


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return


    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)
      formData.append("email", email)


      const res = await fetch(`/api/account/avatar?email=${encodeURIComponent(email)}`, {
        method: "POST",
        body: formData,
      })


      const data = await res.json()
      if (data.avatarUrl) {
        setAvatarUrl(data.avatarUrl + "?t=" + Date.now())
      }
    } catch (err) {
      console.error("Avatar upload failed:", err)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00897B] text-xl font-medium text-white shadow-md overflow-hidden">
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>


      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>


      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}


export default ProfileAvatar


