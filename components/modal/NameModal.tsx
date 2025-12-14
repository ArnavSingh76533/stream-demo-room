import { FC, useState } from "react"
import Modal from "./Modal"
import InputText from "../input/InputText"
import Button from "../action/Button"
import { useRouter } from "next/router"

interface Props {
  show: boolean
  onSubmit: (name: string) => void
}

const NameModal: FC<Props> = ({ show, onSubmit }) => {
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Please enter your name")
      return
    }
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters")
      return
    }
    if (trimmedName.length > 30) {
      setError("Name must be less than 30 characters")
      return
    }
    onSubmit(trimmedName)
  }

  const handleGoBack = () => {
    router.push("/")
  }

  return (
    <Modal title="Enter Your Name" show={show} close={() => {}}>
      <div className="space-y-4">
        <p className="text-dark-300">
          Please enter your name to join this room. This will be your display name visible to other participants.
        </p>
        <div>
          <InputText
            value={name}
            placeholder="Your display name"
            onChange={(value) => {
              setName(value)
              setError("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit()
              }
            }}
            required
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
        <div className="flex justify-between gap-3 pt-2">
          <Button
            tooltip="Go back to home"
            className="px-4 py-2 font-medium"
            actionClasses="bg-dark-700 hover:bg-dark-600 active:bg-dark-500"
            onClick={handleGoBack}
          >
            Go Back
          </Button>
          <Button
            tooltip="Continue with this name"
            className="px-6 py-2.5 font-medium"
            actionClasses="bg-primary-600 hover:bg-primary-700 active:bg-primary-800"
            onClick={handleSubmit}
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default NameModal
