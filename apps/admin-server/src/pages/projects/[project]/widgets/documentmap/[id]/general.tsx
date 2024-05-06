import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import type { DocumentMapProps } from '@openstad-headless/documentMap/src/documentMap';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../../../../../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';

const formSchema = z.object({
  documentUrl: z.string().optional(),
  introTekst: z.string().optional(),
  documentWidth: z.number().optional(),
  documentHeight: z.number().optional(),
  zoom: z.number().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function DocumentGeneral(
  props: DocumentMapProps &
    EditFieldProps<DocumentMapProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<DocumentMapProps>({
    defaultValues: {
      documentUrl: props.documentUrl || '',
      introTekst: props.introTekst || '',
      documentWidth: props.documentWidth || 1920,
      documentHeight: props.documentHeight || 1080,
      zoom: props.zoom || 0,
    },
  });

  return (
    <Form {...form} className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Document instellingen
      </Heading>
      <Separator className="mb-4" />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 lg:w-1/2">
        <FormField
          control={form.control}
          name="introTekst"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Introdocutie tekst</FormLabel>
              <FormControl>
                <Input
                  placeholder="Introductie tekst"
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Url van het document</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/document.pdf"
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breedte van het document</FormLabel>
              <FormControl>
                <Input
                  placeholder="1080"
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentHeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hoogte van het document</FormLabel>
              <FormControl>
                <Input
                  placeholder="1920"
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>

          )}
        />

        <FormField
          control={form.control}
          name="zoom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Standaard zoom waarde (Kleiner is verder uitgezoomd).</FormLabel>
              <FormControl>
                <Input
                  placeholder="-6"
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>

          )}
        />

        <Button type="submit">Opslaan</Button>
      </form>
    </Form>
  );
}
