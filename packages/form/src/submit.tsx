import type { ZodType } from "zod";
import {getSchemaForField} from "./validation.js";
import type {CombinedFieldPropsWithType} from "./props";

export const handleSubmit = (
    fields: Array<CombinedFieldPropsWithType>,
    formValues: { [p: string]: string | string[] | [] },
    setFormErrors: React.Dispatch<React.SetStateAction<{ [p: string]: string | null }>>,
    submitHandler: (values: { [p: string]: string | string[] | []}) => void
) => {
    const errors: { [key: string]: string | null } = {};
    fields?.forEach((field) => {
        if (field.fieldKey) {
            const fieldValue = formValues[field.fieldKey];
            const fieldSchema: ZodType<any> | undefined = getSchemaForField(field);

            if (fieldSchema) {
                try {
                    fieldSchema.parse(fieldValue);
                } catch (error) {
                    let errorMessage = null;

                    if (typeof error === 'object' && error !== null && 'message' in error) {
                        if (typeof error.message === 'string') {
                            const parsedErrors = JSON.parse(error.message);
                            if (Array.isArray(parsedErrors) && parsedErrors.length > 0) {
                                const firstError = parsedErrors[0];
                                errorMessage = firstError.message;
                            }
                        }
                    }

                    errors[field.fieldKey] = errorMessage;
                }
            }
        }
    });

    setFormErrors(errors);

    if (Object.values(errors).every((error) => error === null)) {
        submitHandler(formValues);
    }
};
