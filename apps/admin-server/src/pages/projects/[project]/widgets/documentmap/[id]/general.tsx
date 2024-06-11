import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import type { DocumentMapProps } from '@openstad-headless/document-map/src/document-map';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../../../../../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';
import useResources from '@/hooks/use-resources';
import { useState } from 'react';

const formSchema = z.object({
  resourceId: z.string().optional(),
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
  const [toggle, setToggle] = useState('resourceId_');

  function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const { data } = useResources(props.projectId);
  const resources: Array<{ id: string | number; title: string }> = data || [];

  const form = useForm<DocumentMapProps>({
    defaultValues: {
      resourceId: props.resourceId || undefined,
      resourceIdRelativePath: props?.resourceIdRelativePath || undefined,
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

        {/* <FormObjectSelectField
          form={form}
          fieldName="resourceId"
          fieldLabel="Kies een resource"
          items={resources}
          keyForValue="id"
          label={(resource) => `${resource.id} ${resource.title}`}
          onFieldChanged={props.onFieldChanged}
        /> */}


        <FormObjectSelectField
          form={form}
          fieldName="resourceId"
          fieldLabel="Koppel aan een specifieke resource"
          items={resources}
          keyForValue="id"
          label={(resource) => `${resource.id} ${resource.title}`}
          onFieldChanged={(e, key) => {
            props.onFieldChanged
            setToggle(e + '_' + key);
          }}
          noSelection="Niet koppelen - beschrijf het path of gebruik queryparam openstadResourceId"
        />
        {toggle === 'resourceId_' ? (
          <FormField
            control={form.control}
            name="resourceIdRelativePath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Geen specifieke resource gekoppeld?
                </FormLabel>
                <em className="text-xs">Beschrijf hoe de resource gehaald wordt uit de url: (/pad/naar/[id]) of laat leeg om terug te vallen op ?openstadResourceId</em>
                <FormControl>
                  <Input {...field} onChange={(e) => {
                    onFieldChange(field.name, e.target.value);
                    field.onChange(e);
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}


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
