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
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  resource: z.enum([
    'resource',
    'article',
    'activeUser',
    'resourceUser',
    'submission',
  ]),
  displayType: z.enum(['cardrow', 'cardgrid', 'raw']),
});

export default function WidgetResourceOverviewGeneral() {
  type FormData = z.infer<typeof formSchema>;
  const category = 'general';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    resource: widget?.config?.[category]?.resource || 'resource',
    displayType: widget?.config?.[category]?.displayType || 'cardrow',
  });

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error('could falset update', error);
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="resource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Resource" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="article">Artikel</SelectItem>
                    <SelectItem value="activeUser">
                      Actieve gebruiker
                    </SelectItem>
                    <SelectItem value="resourceUser">
                      Gebruiker van de resource
                    </SelectItem>
                    <SelectItem value="submission">Oplevering</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayType"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Display type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Cards op een row - Linkt naar items op een andere pagina." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cardrow">
                      Cards op een row - Linkt naar items op een andere pagina.
                    </SelectItem>
                    <SelectItem value="cardgrid">
                      Cards op een grid - Opent items op dezelfde pagina.
                    </SelectItem>
                    <SelectItem value="raw">
                      Creëer je eigen template.
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
