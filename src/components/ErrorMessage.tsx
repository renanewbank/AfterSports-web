type Props = {
  message: string
}

const ErrorMessage = ({ message }: Props) => (
  <div className="error-box" role="alert">
    {message}
  </div>
)

export default ErrorMessage
