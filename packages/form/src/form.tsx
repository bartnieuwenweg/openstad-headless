import React, { FC, useState } from 'react';
import { FormProps, FieldProps } from "./props.js";
import TextInput from "@openstad-headless/ui/src/form-elements/text/main";
import RangeSlider from "@openstad-headless/ui/src/form-elements/a-b-slider/main";
import CheckboxField from "@openstad-headless/ui/src/form-elements/checkbox/main";
import RadioboxField from "@openstad-headless/ui/src/form-elements/radio/main";
import SelectField from "@openstad-headless/ui/src/form-elements/select/main";
import TickmarkSlider from "@openstad-headless/ui/src/form-elements/tickmark-slider/main";
import FileUploadField from "@openstad-headless/ui/src/form-elements/file-upload/main";
import { handleSubmit } from "./submit.js";

const Form: FC<FormProps> = ({
     title = 'Form Widget',
     fields = [],
     submitText = 'Verzenden',
     submitHandler = () => {},
 }) => {
    const initialFormValues: { [key: string]: any } = {};
    fields.forEach((field) => {
        if (field.fieldKey) {
            initialFormValues[field.fieldKey] = '';
        }
    });

    const [formValues, setFormValues] = useState(initialFormValues);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string | null }>({});

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        handleSubmit(fields, formValues, setFormErrors, submitHandler);
    };

    const handleInputChange = (event) => {
        const { name, value } = event;
        setFormValues({ ...formValues, [name]: value });
    };

    const renderField = (field: FieldProps) => {
        switch (field.type) {
            case 'text':
                return (
                    <TextInput
                        {...field}
                        onChange={handleInputChange}
                    />
                );
            case 'range':
                return (
                    <RangeSlider
                        {...field}
                        onChange={handleInputChange}
                    />
                );
            case 'checkbox':
                return (
                    <CheckboxField
                        {...field}
                        onChange={handleInputChange}
                    />
                );
            case 'radiobox':
                return (
                    <RadioboxField
                        {...field}
                        onChange={handleInputChange}
                    />
                );
            case 'select':
                return (
                    <SelectField
                        {...field}
                        onChange={handleInputChange}
                    />
                );
            case 'tickmark-slider':
                return (
                    <TickmarkSlider
                        {...field}
                        onChange={handleInputChange}
                    />
                );
            case 'upload':
                return (
                    <FileUploadField
                        {...field}
                        onChange={handleInputChange}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="form-widget">
            <div className="form-widget-container">
                {title ? <h5 className="like-widget-title">{title}</h5> : null}

                <form onSubmit={handleFormSubmit} className="form-container" noValidate>
                    {fields.map((field: FieldProps, index: number) => (
                        <div key={index}>
                            {renderField(field)}
                            <div className="error-message">
                                {formErrors[field.fieldKey] && <span>{formErrors[field.fieldKey]}</span>}
                            </div>
                        </div>
                    ))}
                    <button type="submit">{submitText}</button>
                </form>
            </div>
        </div>
    );
};

export default Form;
