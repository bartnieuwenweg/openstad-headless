import React, { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import { SimpleCalendar } from '@/components/simple-calender-popup';
import useResource from '@/hooks/use-resource';
import toast from 'react-hot-toast';
import { ImageUploader } from './image-uploader';
import useTags from '@/hooks/use-tags';
import useStatuses from '@/hooks/use-statuses';
import { CheckboxList } from './checkbox-list';
import { X } from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import useImageResource from "@/hooks/use-image-resource";

const onlyNumbersMessage = 'Dit veld mag alleen nummers bevatten';
const minError = (field: string, nr: number) =>
  `${field} moet minimaal ${nr} karakters bevatten`;
const maxError = (field: string, nr: number) =>
  `${field} mag maximaal ${nr} karakters bevatten`;

const formSchema = z.object({
  userId: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),

  title: z
    .string()
    .min(10, minError('Titel', 10))
    .max(50, maxError('Titel', 50))
    .default(''),
  summary: z
    .string()
    .min(20, minError('Samenvatting', 20))
    .max(140, maxError('Samenvatting', 140))
    .default(''),
  description: z
    .string()
    .min(140, minError('Beschrijving', 140))
    .max(5000, maxError('Beschrijving', 5000))
    .default(''),

  budget: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .default(0),
  budgetMin: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),
  budgetMax: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),
  budgetInterval: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),

  startDate: z.date(),
  publishDate: z.date().optional(),

  modBreak: z.coerce.string().optional(),
  modBreakUserId: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),
  modBreakDate: z.date().optional(),

  location: z.string().optional(),
  image: z.string().optional(),
  images: z
    .array(z.object({ url: z.string() }))
    .optional()
    .default([]),

  extraData: z
    .object({
      originalId: z.coerce
        .number({ invalid_type_error: onlyNumbersMessage })
        .optional(),
    })
    .default({}),
  tags: z.number().array().default([]),
  statuses: z.number().array().default([]),
});

type FormType = z.infer<typeof formSchema>;

type Props = {
  onFormSubmit: (body: FormType) => Promise<any>;
  type: 'resource' | 'image-resource';
};

export default function ResourceForm({ onFormSubmit, type }: Props) {
  const router = useRouter();
  const { project, id } = router.query;
  const { data: projectData } = useProject();

  const [existingData, setExistingData] = useState(null);

  const resourceData = useResource(project as string, id as string);
  const imageResourceData = useImageResource(project as string, id as string);

  useEffect(() => {
    if (type === 'resource') {
      setExistingData(resourceData.data);
    } else if (type === 'image-resource') {
      setExistingData(imageResourceData.data);
    }
  }, [type, resourceData, imageResourceData]);

  const { data: tags, error: tagError } = useTags(project as string);
  const { data: statuses, error: statusError } = useStatuses(project as string);

  let loadedTags = (tags || []) as {
    id: number;
    name: string;
    type?: string;
  }[];

  let loadedStatuses = (statuses || []) as {
    id: number;
    name: string;
  }[];

  loadedTags = loadedTags
    .sort((a, b) => {
      const aType = a.type ?? '';
      const bType = b.type ?? '';

      if (aType < bType) return -1;
      if (aType > bType) return 1;

      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
  const budgetFallback = (existingData: any, key: string = '') => {
    if (!existingData) return 0;

    if (typeof existingData?.budget === 'number') {
      return existingData.budget;
    }

    return existingData[key] || 0;
  };

  const defaults = useCallback(
    (): FormType => ({
      userId: existingData?.userId || undefined,

      title: existingData?.title || '',
      summary: existingData?.summary || '',
      description: existingData?.description || '',
      budget: budgetFallback(existingData),
      budgetMin: budgetFallback(existingData, 'min'),
      budgetMax: budgetFallback(existingData, 'max'),
      budgetInterval: budgetFallback(existingData, 'interval'),
      tags:
        existingData?.tags?.map((t: any) => t.id) ||
        projectData?.config?.resources?.defaultTagIds ||
        [],
      statuses:
        existingData?.statuses?.map((t: any) => t.id) ||
        projectData?.config?.resources?.defaultStatusIds ||
        [],
      startDate: existingData?.startDate
        ? new Date(existingData?.startDate)
        : new Date(),
      publishDate: existingData?.publishDate
        ? new Date(existingData.publishDate)
        : undefined,

      modBreak: existingData?.modBreak || '',
      modBreakUserId: existingData?.modBreakUserId || undefined,
      modBreakDate: existingData?.modBreakDate
        ? new Date(existingData.modBreakDate)
        : undefined,

      location: existingData?.location
        ? JSON.stringify(existingData?.location)
        : '',
      image: '',
      images: existingData?.images || [],
      extraData: {
        originalId: existingData?.extraData?.originalId || undefined,
      },
    }),
    [existingData]
  );

  const form = useForm<FormType>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  function onSubmit(values: FormType) {
    onFormSubmit(values)
      .then(() => {
        toast.success(`Plan successvol ${id ? 'aangepast' : 'aangemaakt'}`);

        const pushUrl = type === 'image-resource' ? `/projects/${project}/image-resources` : `/projects/${project}/resources`;

        router.push(pushUrl);
      })
      .catch((e) => {
        toast.error(`Plan kon niet ${id ? 'aangepast' : 'aangemaakt'} worden`);
      });
  }

  useEffect(() => {
    if (existingData) {
      form.reset(defaults());
    } else {
      let resetValues:{ tags?: number[]; statuses?: number[]; } = {};
      if (projectData?.config?.resources?.defaultTagIds) {
        const selectedTags = form.getValues('tags') || [];

        if (selectedTags.length === 0) {
          const projectTags = Array.isArray(projectData.config.resources.defaultTagIds)
            ? projectData.config.resources.defaultTagIds
            : [];
          resetValues.tags = Array.from(new Set([...selectedTags, ...projectTags]));
        }
      }
      if (projectData?.config?.resources?.defaultStatusIds) {
        const selectedStatuses = form.getValues('statuses') || [];

        if (selectedStatuses.length === 0) {
          const projectStatuses = Array.isArray(projectData.config.resources.defaultStatusIds)
            ? projectData.config.resources.defaultStatusIds
            : [];
          resetValues.statuses = Array.from(new Set([...selectedStatuses, ...projectStatuses]));
        }
      }
      form.reset(resetValues);
    }
  }, [existingData, form, defaults, projectData?.config?.resources?.defaultTagIds, projectData?.config?.resources?.defaultStatusIds]);

  const { fields: imageFields, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">{id ? 'Aanpassen' : 'Toevoegen'}</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-2/3 grid grid-cols-2 lg:auto-rows-fit" style={{gap: '2.5rem'}}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Samenvatting</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-2 md:col-span-2 lg:col-span-2">
                <FormLabel>Beschrijving</FormLabel>
                <FormControl>
                  <Textarea rows={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ImageUploader
            form={form}
            fieldName="image"
            onImageUploaded={(imageResult) => {
              let array = [...(form.getValues('images') || [])];
              array.push(imageResult);
              form.setValue('images', array);
              form.resetField('image');
              form.trigger('images');
            }}
          />

            <div className="space-y-2 col-span-full md:col-span-1 flex flex-col">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Afbeeldingen</label>
                <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                    {imageFields.map(({ id, url }, index) => {
                        return (
                            <div key={id} style={{ position: 'relative' }}>
                                <img src={url} alt={url} />
                                <Button
                                    color="red"
                                    onClick={() => {
                                        removeImage(index);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                    }}>
                                    <X size={24} />
                                </Button>
                            </div>
                        );
                    })}
                </section>
             </div>

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extraData.originalId"
            render={({ field }) => (
              <FormItem className="col-span-full col-span-1">
                <FormLabel>
                  Resource ID van het originele resource (optioneel)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>ID van de gebruiker die aan deze resource is gekoppeld (optioneel)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="budgetMin"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Minimum budget (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetMax"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Maximum budget (optioneel)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetInterval"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Interval budget (optioneel)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Locatie (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="lg:col-span-2 my-6" />

          <FormField
            control={form.control}
            name="modBreak"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Inhoud van de Modbreak</FormLabel>
                <FormDescription>Laat dit veld leeg om geen Modbreak bij deze resource te tonen</FormDescription>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modBreakUserId"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>ID van de gebruiker die aan de Modbreak is gekoppeld (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-auto col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="modBreakDate"
              label="Datum van de ModBreak (optioneel)"
              placeholder="Kies een datum"
              withReset
            />
          </div>

          <Separator className="lg:col-span-2 my-6" />

          <div className="mt-auto col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="publishDate"
              label="Publiceer datum van de resource"
              description="Als er geen publiceer datum is zal de resource worden opgeslagen als concept. Dit houdt in dat de resource niet zichtbaar zal zijn op de site."
              withReset
            />
          </div>
          <div className="col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="startDate"
              label="Startdatum resource"
            />
          </div>

          <CheckboxList
            form={form}
            fieldName="tags"
            fieldLabel="Selecteer de gewenste tags die bij een resource weergegeven zullen
               worden."
            label={(t) => t.name}
            keyForGrouping="type"
            keyPerItem={(t) => `${t.id}`}
            items={loadedTags}
            layout="vertical"
            selectedPredicate={(t) =>
              form.getValues('tags').findIndex((tg) => tg === t.id) > -1
            }
            onValueChange={(tag, checked) => {
              const values = form.getValues('tags');
              form.setValue(
                'tags',
                checked
                  ? [...values, tag.id]
                  : values.filter((id) => id !== tag.id)
              );
            }}
          />

          <CheckboxList
            form={form}
            fieldName="statuses"
            fieldLabel="Status"
            layout="vertical"
            label={(t) => t.name}
            keyPerItem={(t) => `${t.id}`}
            items={loadedStatuses}
            selectedPredicate={(t) =>
              form.getValues('statuses').findIndex((tg) => tg === t.id) > -1
            }
            onValueChange={(status, checked) => {
              const values = form.getValues('statuses');
              form.setValue(
                'statuses',
                checked
                  ? [...values, status.id]
                  : values.filter((id) => id !== status.id)
              );
            }}
          />
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}