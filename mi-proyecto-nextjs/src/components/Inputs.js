
export default function input({type = "text", placeholder, name, value ,onChange}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
    />
  );
}
