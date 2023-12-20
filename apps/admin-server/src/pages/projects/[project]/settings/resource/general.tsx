import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

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
import { useEffect } from 'react';
import { useProject } from '../../../../../hooks/use-project';
import { Checkbox } from '@/components/ui/checkbox';

const labels = [
  {
    id: "open",
    label: "Open"
  },
  {
    id: "closed",
    label: "Gesloten"
  },
  {
    id: "rejected",
    label: "Afgewezen"
  },
  {
    id: "accepted",
    label: "Geaccepteerd"
  },
  {
    id: "done",
    label: "Afgerond"
  },
  {
    id: "considered",
    label: "In overweging"
  }
];

const reactions = [
  {
    id: "showReactions",
    label: "Laat de reacties voor en tegen zien."
  },
  {
    id: "showReactionsWithoutSentiment",
    label: "Laat de reacties zonder sentiment zien."
  },
  {
    id: "allowReactions",
    label: "Laat gebruikers reageren op reacties van anderen."
  },
  {
    id: "likeReactions",
    label: "Laat gebruikers de reacties van andere gebruikers liken."
  }
]

const formSchema = z.object({
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  image: z.string().optional(),
  location: z.string(),
  theme: z.string(),
  neighbourhood: z.string(),
  label: z.array(z.string()).refine((value) => value.some((item) => item)),
  modBreakAuthor: z.string(),
  likeTitle: z.string(),
  enableLikes: z.boolean(),
  enableReactions: z.boolean(),
  displayLikes: z.boolean(),
  displayDislikes: z.boolean(),
  reactionSettings: z.array(z.string()).refine((value) => value.some((item) => item))
});

export default function ProjectSettingsResourceGeneral() {
  const category = 'resource';

  const { data, isLoading, updateProject } = useProject();
  const defaults = () => ({
    title: data?.config?.[category]?.title || null,
    summary: data?.config?.[category]?.summary || null,
    description: data?.config?.[category]?.description || null,
    image: data?.config?.[category]?.image || null,
    location: data?.config?.[category]?.location || null,
    theme: data?.config?.[category]?.theme || null,
    neighbourhood: data?.config?.[category]?.neighbourhood || null,
    label: data?.config?.[category]?.title || [],
    modBreakAuthor: data?.config?.[category]?.modBreakAuthor || null,
    likeTitle: data?.config?.[category]?.likeTitle || null,
    enableLikes: data?.config?.[category]?.enableLikes || null,
    enableReactions: data?.config?.[category]?.enableReactions || null,
    displayLikes: data?.config?.[category]?.displayLikes || null,
    displayDislikes: data?.config?.[category]?.displayDislikes || null,
    reactionSettings: data?.config?.[category]?.reactionSettings || [],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [data]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateProject({
        [category]: {
          title: values.title,
          summary: values.summary,
          description: values.description,
          image: values.image,
          location: values.location,
          theme: values.theme,
          neighbourhood: values.neighbourhood,
          label: values.label,
          modBreakAuthor: values.modBreakAuthor,
          likeTitle: values.likeTitle,
          enableLikes: values.enableLikes,
          enableReactions: values.enableReactions,
          displayLikes: values.displayLikes,
          displayDislikes: values.displayDislikes,
          reactionSettings: values.reactionSettings
        },
      });
    } catch (error) {
      console.error('could not update', error);
    }
  }

  return (
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Resource template</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Titel van de resource
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Samenvatting
                    </FormLabel>
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
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Beschrijving
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Afbeelding
                    </FormLabel>
                    <FormControl>
                      <Input type='file' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Locatie
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Thema
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="neighbourhood"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Buurt
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="label"
                render={() => (
                  <FormItem>
                    <div>
                      <FormLabel>Selecteer uw gewenste sorteeropties</FormLabel>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 gap-x-4">
                      {labels.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="label"
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
                                          ? field.onChange([...field.value, item.id])
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
              <FormField
                control={form.control}
                name="modBreakAuthor"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Auteur modbreaks
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="likeTitle"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Titel voor likebox
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enableLikes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Is het mogelijk om likes te plaatsen?
                    </FormLabel>
                    <Select
                      onValueChange={(e: string) =>
                        field.onChange(e === 'true')
                      }
                      value={field.value ? 'true' : 'false'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Ja</SelectItem>
                        <SelectItem value="false">Nee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enableReactions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Is het mogelijk om reacties te plaatsen?
                    </FormLabel>
                    <Select
                      onValueChange={(e: string) =>
                        field.onChange(e === 'true')
                      }
                      value={field.value ? 'true' : 'false'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Ja</SelectItem>
                        <SelectItem value="false">Nee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayLikes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Worden likes weergegeven?
                    </FormLabel>
                    <Select
                      onValueChange={(e: string) =>
                        field.onChange(e === 'true')
                      }
                      value={field.value ? 'true' : 'false'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Ja</SelectItem>
                        <SelectItem value="false">Nee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayDislikes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Worden dislikes weergegeven?
                    </FormLabel>
                    <Select
                      onValueChange={(e: string) =>
                        field.onChange(e === 'true')
                      }
                      value={field.value ? 'true' : 'false'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Ja</SelectItem>
                        <SelectItem value="false">Nee</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <FormLabel>Selecteer uw gewenste reactie instellingen</FormLabel>
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
                                          ? field.onChange([...field.value, item.id])
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
              <Button type="submit" className="w-fit col-span-full">
                Opslaan
              </Button>
            </form>
          </Form>
        </div>
  );
}
