import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { PageLayout } from '@/components/ui/page-layout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useProject } from '../../../../../hooks/use-project';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import useTags from '@/hooks/use-tags';
import _ from 'lodash';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { CheckboxList } from '@/components/checkbox-list';

const reactions = [
  {
    id: 'showReactions',
    label: 'Laat de reacties voor en tegen zien.',
  },
  {
    id: 'showReactionsWithoutSentiment',
    label: 'Laat de reacties zonder sentiment zien.',
  },
  {
    id: 'allowReactions',
    label: 'Laat gebruikers reageren op reacties van anderen.',
  },
  {
    id: 'likeReactions',
    label: 'Laat gebruikers de reacties van andere gebruikers liken.',
  },
];

type Tag = {
  id: number;
  name: string;
  type: string;
};

const formSchema = z.object({
  canAddNewResources: z.boolean(),
  minimumYesVotes: z.coerce.number(),
  titleMinLength: z.coerce.number(),
  titleMaxLength: z.coerce.number(),
  summaryMinLength: z.coerce.number(),
  summaryMaxLength: z.coerce.number(),
  descriptionMinLength: z.coerce.number(),
  descriptionMaxLength: z.coerce.number(),
  displayLocation: z.boolean(),
  displayTheme: z.boolean(),
  displayNeighbourhood: z.boolean(),
  displayModbreak: z.boolean(),
  modbreakTitle: z.string().optional(),
  reactionSettings: z.string().array(),
  tagGroups: z.number().array().optional().default([]),
});

export default function ProjectSettingsResource() {
  const router = useRouter();
  const { project } = router.query;
  const category = 'resources';

  const { data, isLoading, updateProject } = useProject();
  const { data: tagData } = useTags(project as string);
  const tags = (tagData || []) as Tag[];

  const defaults = React.useCallback(
    () => ({
      canAddNewResources: data?.config?.[category]?.canAddNewResources || false,
      minimumYesVotes: data?.config?.[category]?.minimumYesVotes || null,
      titleMinLength: data?.config?.[category]?.titleMinLength || null,
      titleMaxLength: data?.config?.[category]?.titleMaxLength || null,
      summaryMinLength: data?.config?.[category]?.summaryMinLength || null,
      summaryMaxLength: data?.config?.[category]?.summaryMaxLength || null,
      descriptionMinLength:
        data?.config?.[category]?.descriptionMinLength || null,
      descriptionMaxLength:
        data?.config?.[category]?.descriptionMaxLength || null,
      displayLocation: data?.config?.[category]?.displayLocation || false,
      displayTheme: data?.config?.[category]?.displayTheme || false,
      displayNeighbourhood:
        data?.config?.[category]?.displayNeighbourhood || false,
      displayModbreak: data?.config?.[category]?.displayModbreak || false,
      modbreakTitle: data?.config?.[category]?.modbreakTitle || null,
      reactionSettings: data?.config?.[category]?.reactionSettings || [],
      tagGroups: data?.config?.resources?.tags || [],
    }),
    [data?.config]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  React.useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject({
        [category]: {
          canAddNewResources: values.canAddNewResources,
          minimumYesVotes: values.minimumYesVotes,
          titleMinLength: values.titleMinLength,
          titleMaxLength: values.titleMaxLength,
          summaryMinLength: values.summaryMinLength,
          summaryMaxLength: values.summaryMaxLength,
          descriptionMinLength: values.descriptionMinLength,
          descriptionMaxLength: values.descriptionMaxLength,
          displayLocation: values.displayLocation,
          displayTheme: values.displayTheme,
          displayNeighbourhood: values.displayNeighbourhood,
          displayModbreak: values.displayModbreak,
          modbreakTitle: values.modbreakTitle,
          reactionSettings: values.reactionSettings,
          tags: values.tagGroups || [],
        },
      });
      if (project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.');
      }
    } catch (error) {
      console.error('could not update', error);
    }
  }

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Instellingen',
            url: `/projects/${project}/settings`,
          },
          {
            name: 'Resource',
            url: `/projects/${project}/settings/resource`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Resource template</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="canAddNewResources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Is het mogelijk om een resource in te sturen?
                    </FormLabel>
                    {YesNoSelect(field, {})}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minimumYesVotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Minimum benodigde stemmen voor een resource?
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titleMinLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Minimum lengte van titel</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titleMaxLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Maximum lengte van titel</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summaryMinLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Minimum lengte van samenvatting</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summaryMaxLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Maximum lengte van samenvatting</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="140" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionMinLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Minimum lengte van de beschrijving</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="140" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionMaxLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Maximum lengte van de beschrijving</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Wordt het invoerveld voor de locatie weergegeven in het
                      resource-formulier?
                    </FormLabel>
                    {YesNoSelect(field, {})}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayTheme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Wordt het invoerveld voor het thema weergegeven in het
                      resource-formulier?
                    </FormLabel>
                    {YesNoSelect(field, {})}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayNeighbourhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Wordt het invoerveld voor de buurt weergegeven in het
                      resource-formulier?
                    </FormLabel>
                    {YesNoSelect(field, {})}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayModbreak"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Wordt het invoerveld voor de auteur van de modbreak
                      weergegeven in het resource-formulier?
                    </FormLabel>
                    {YesNoSelect(field, {})}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modbreakTitle"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Titel voor boven modbreak 
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Text die boven de modbreak wordt getoond"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reactionSettings"
                render={() => (
                  <FormItem>
                    <div>
                      <FormLabel>
                        Selecteer uw gewenste reactie instellingen
                      </FormLabel>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 gap-x-4">
                      {reactions.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="reactionSettings"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked: any) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            item.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <CheckboxList
                form={form}
                fieldName="tagGroups"
                fieldLabel="Selecteer de gewenste tags die bij een resource weergegeven zullen
               worden."
                label={(t) => t.name}
                keyForGrouping="type"
                keyPerItem={(t) => `${t.id}`}
                items={tags}
                selectedPredicate={(t) =>
                  form.getValues('tagGroups').findIndex((tg) => tg === t.id) >
                  -1
                }
                onValueChange={(tag, checked) => {
                  const values = form.getValues('tagGroups');

                  form.setValue(
                    'tagGroups',
                    checked
                      ? [...values, tag.id]
                      : values.filter((id) => id !== tag.id)
                  );
                }}
              />

              <Button type="submit" className="w-fit col-span-full">
                Opslaan
              </Button>
            </form>
          </Form>
          <div className="p-6 bg-white rounded-md mt-4">
            <Heading size="xl" className="mb-4">
              Resource mail template
            </Heading>
            <Separator className="mb-4" />
            <form
              onSubmit={() => {}}
              className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="col-span-full space-y-2">
                <Label>Type e-mail</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thanks">Bedank-mail</SelectItem>
                    <SelectItem value="submit">
                      Opleveren van concept-plan
                    </SelectItem>
                    <SelectItem value="publish">
                      Uitbrengen van concept-plan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-full space-y-2">
                <Label>Vanaf adres</Label>
                <Input id="mail" placeholder="email@example.com" />
              </div>
              <div className="col-span-full space-y-2">
                <Label>Onderwerp</Label>
                <Input id="subject" placeholder="Onderwerp van de mail" />
              </div>
              <div className="col-span-full space-y-2">
                <Label>E-mail tekst template</Label>
                <Textarea id="template" placeholder="Inhoud van de mail" />
              </div>
              <Button type="button" className="w-fit mt-4">
                Opslaan
              </Button>
            </form>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
