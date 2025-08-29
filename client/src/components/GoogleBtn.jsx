import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'

export default function GoogleBtn({ onSuccess, onError }) {
  const api = import.meta.env.VITE_API_URL
  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={async (cred) => {
          try {
            const res = await axios.post(`${api}/auth/google`, { idToken: cred.credential })
            onSuccess && onSuccess(res.data)
          } catch (e) {
            onError && onError(e.response?.data?.error || "Google login failed")
          }
        }}
        onError={() => onError && onError("Google login failed")}
      />
    </div>
  )
}
