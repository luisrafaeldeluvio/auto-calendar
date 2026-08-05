import { useId } from "react";

type FormInputProps = {
  label: string;
  id?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;


export const FormInput = ({ label, id = useId(), ...props }: FormInputProps) => {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </>
  );
};

