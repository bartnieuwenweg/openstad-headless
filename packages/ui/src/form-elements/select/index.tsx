import {
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
    Select,
    SelectOption
} from "@utrecht/component-library-react";
import {FC} from "react";

export type SelectFieldProps = {
    title?: string;
    description?: string;
    choices?: string[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
}

const SelectField: FC<SelectFieldProps> = ({
      title,
      description,
      choices = [],
      fieldKey,
      defaultOption = 'Selecteer een optie',
      fieldRequired= false,
      onChange
}) => {
    return (
        <FormField type="select">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={fieldKey}>{title}</FormLabel>
                <FormFieldDescription>{description}</FormFieldDescription>
            </Paragraph>
            <Paragraph className="utrecht-form-field__input">
                <Select
                    className="form-item"
                    name={fieldKey}
                    required={fieldRequired}
                    onChange={(e) => onChange({
                        name: fieldKey,
                        value: e.target.value
                    })}
                >
                    <SelectOption value="">
                        {defaultOption}
                    </SelectOption>
                    {choices?.map((value, index) => (
                        <SelectOption value={value} key={index}>
                            {value}
                        </SelectOption>
                    ))}
                </Select>
            </Paragraph>
        </FormField>
    );
};

export default SelectField;
