import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as Switch from '@radix-ui/react-switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import useTags from '@/hooks/use-tags';
import { useForm } from 'react-hook-form';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import type { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props'
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import * as z from 'zod';
import { ResourceOverviewMapWidgetTabProps } from '.';
import { Textarea } from '@/components/ui/textarea';
import useAreas from '@/hooks/use-areas';
import { Checkbox } from '@openstad-headless/ui/src';
import { CheckboxList } from '@/components/checkbox-list';

type Tag = {
  id: number;
  name: string;
  type: string;
};

const formSchema = z.object({
  markerHref: z.string().optional(),
  autoZoomAndCenter: z.enum(['markers', 'area']).optional(),
  categorize: z.object({
    categorizeByField: z.string().optional(),
  }),
  clustering: z.object({
    isActive: z.boolean().optional(),
  }),
  tilesVariant: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  customPolygon: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
});


type SchemaKey = keyof typeof formSchema.shape;

export default function WidgetResourcesMapMap(
  props: ResourceOverviewMapWidgetTabProps &
    EditFieldProps<ResourceOverviewMapWidgetTabProps> & {
      omitSchemaKeys?: Array<SchemaKey>;
      customPolygon?: any;
    }
) {

  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    console.log('on submit', values);
    props.updateConfig({ ...props, ...values });
  }

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      markerHref: props?.markerHref || '',
      autoZoomAndCenter: props?.autoZoomAndCenter || 'markers',
      clustering: props?.clustering || {},
      categorize: props?.categorize || {},
      tilesVariant: props?.tilesVariant || '',
      width: props?.width || '',
      height: props?.height || '',
      customPolygon: props?.customPolygon || [],
    },
  });

  const { data: tags } = useTags(props.projectId);
  const { data: areas } = useAreas(props.projectId) as { data: { id: string, name: string }[] } ?? [];


  const [tagGroupNames, setGroupedNames] = useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(tags)) {
      const fetchedTags = tags as Array<Tag>;
      let groupNames = fetchedTags.map(tag => tag.type);
      groupNames = groupNames.filter((value, index, array) => {
        return array.indexOf(value) == index;
      });
      setGroupedNames(groupNames);
    }
  }, [tags]);


  interface Area {
    id: string | number; // Assuming id can be string or number
    name: string;
  }

  interface CustomPolygon {
    id: string | number;
    // Add other properties of the status object as needed
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Map</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">

          <FormField
            control={form.control}
            name="markerHref"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Link naar de specifieke resource
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Bijv: /resource?openstadResourceId=[id]"
                    type="text"
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autoZoomAndCenter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Automatisch inzoomen en centreren
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    props.onFieldChanged(field.name, value);
                    field.onChange(value);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een optie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="" disabled>Selecteer een optie</SelectItem>
                    <SelectItem value="markers">Toon de markers</SelectItem>
                    <SelectItem value="area">Toon het gebied</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/*
          <FormField
            control={form.control}
            name="clustering.isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                Cluster icons die dicht bij elkaar liggen
                </FormLabel>
                <Switch.Root
                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                  onCheckedChange={(value: boolean) => {
                      props.onFieldChanged(field.name, value);
                      field.onChange(value);
                  }}
                  checked={field.value}>
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                </Switch.Root>
                <FormMessage />
              </FormItem>
            )}
          />
          */}

          <FormField
            control={form.control}
            name="categorize.categorizeByField"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Gebruik tags van dit type om de resources te tonen, dwz. gebruik de iconen en kleuren van de tag.
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    props.onFieldChanged(field.name, value);
                    field.onChange(value);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een optie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Geen (gebruik alleen standaardiconen)</SelectItem>
                    {tagGroupNames.map(type => (
                      <SelectItem value={type} key={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tilesVariant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Kaart stijl
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    props.onFieldChanged(field.name, value);
                    field.onChange(value);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een optie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="" disabled>Selecteer een optie</SelectItem>
                    <SelectItem value="nlmaps">NL maps</SelectItem>
                    <SelectItem value="amaps">Amsterdams</SelectItem>
                    <SelectItem value="openstreetmaps">Open Street Maps</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Breedte
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Bijv: 100%"
                    type="text"
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoogte
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Bijv: 350px"
                    type="text"
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="customPolygon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Standaard polygoon overschrijven (GeoJSON)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder=""
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}



          <CheckboxList
            form={form}
            fieldName="customPolygon"
            fieldLabel="Gebieden"
            items={areas}
            label={(t) => `${t.name} -- id:${t.id}`}
            keyPerItem={(t) => `${t.id}`}
            layout="vertical"
            selectedPredicate={(t) => {
              const customPolygonValues = form.getValues('customPolygon');
              if (Array.isArray(customPolygonValues)) {
                return customPolygonValues.findIndex((tg) => `${tg.id}` === `${t.id}`) !== -1;
              }
              return false;
            }}
            onValueChange={(status, checked) => {
              let values = form.getValues('customPolygon');
              values = Array.isArray(values) ? values : [];

              if (checked) {
                const isAlreadyIncluded = values.some((item) => `${item.id}` === `${status.id}`);
                if (!isAlreadyIncluded) {
                  form.setValue('customPolygon', [...values, { ...status, id: typeof status.id === 'number' ? status.id : parseInt(status.id, 10) }]);
                }
              } else {
                const filteredValues = values.filter((item) => `${item.id}` !== `${status.id}`);
                form.setValue('customPolygon', filteredValues);
              }
            }}
          />


          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
