import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import nunjucks from 'nunjucks';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import useNotificationTemplate from '@/hooks/use-notification-template';

const initialData = `<mjml>
    <mj-body>
      <mj-raw>
        <!-- Company Header -->
      </mj-raw>
      <mj-section>
        <mj-column>
          <mj-image src="{{imagePath}}/logo-openstad.png" height="70px" width="99px">
          </mj-image>
        </mj-column>
      </mj-section>
      <mj-raw>
        <!-- Image Header -->
      </mj-raw>
      <mj-section>
        <mj-column width="600px">
          <mj-image src="{{imagePath}}/mail-header.jpg"></mj-image>
        </mj-column>
      </mj-section>
      <mj-raw>
        <!-- Mail context -->
      </mj-raw>
      <mj-section>
        <mj-column width="400px">
          <mj-text font-size="20px" font-family="Helvetica Neue">Inlogmail aangevraagd</mj-text>
          <mj-text>Beste {{user}},</mj-text>
          <mj-text color="#525252">Voor Admin panel is een inloglink aangevraagd voor dit emailadres. Klik op de knop hieronder om automatisch in te loggen. De knop is 10 minuten geldig. </mj-text>
          <mj-button background-color="#12B886" href="{{loginurl}}">Log in</mj-button>
        </mj-column>
      </mj-section>
      <mj-raw>
        <!-- Alternate link -->
      </mj-raw>
      <mj-section>
        <mj-column width="400px">
          <mj-text>Of gebruik deze link in je browser:</mj-text>
        </mj-column>
        <mj-column>
          <mj-text>{{loginurl}}</mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>`;


const getUserName = () => {
  if (typeof window !== "undefined") {
      const user = JSON.parse(sessionStorage.getItem('openstad') as string);
      return user[Object.keys(user)[0]].openStadUser.name || 'Gebruiker';
  }
}

const context = {
  user: getUserName(),
  loginurl: 'https://openstad.nl/login',
  imagePath: process.env.EMAIL_ASSETS_URL
};



type Props = {
  type:
  | 'login email'
  | 'login sms'
  | 'new published resource - user feedback'
  | 'updated resource - user feedback'
  | 'user account about to expire';
  engine?: 'email' | 'sms';
  id?: string;
  label?: string;
  subject?: string;
  body?: string;
}

const notificationTypes = {
  'login email': 'Inloggen via e-mail',
  'login sms': 'Inloggen via sms',
  'new published resource - user feedback': 'Nieuwe resource gepubliceerd - Notificatie naar de gebruiker',
  'updated resource - user feedback': 'Resource bijgewerkt - Notificatie naar de gebruiker',
  'user account about to expire': 'Gebruikersaccount staat op het punt te verlopen'
};

const formSchema = z.object({
  engine: z.enum(['email', 'sms']),
  label: z.string().min(1, {
    message: 'De label mag niet leeg zijn!',
  }).max(255, {
    message: 'De label mag niet langer dan 255 karakters zijn!',
  }),
  subject: z.string().min(1, {
    message: 'Het onderwerp mag niet leeg zijn!',
  }).max(255, {
    message: 'Het onderwerp mag niet langer dan 255 karakters zijn!',
  }),
  body: z.string().min(1, {
    message: 'De inhoud mag niet leeg zijn!',
  }),
});

export function NotificationForm({ type, engine, id, label, subject, body }: Props) {
  const router = useRouter();
  const project = router.query.project as string;
  const { data, create, update } = useNotificationTemplate(project as string)
  const notificationTitle = notificationTypes[type];

  const defaults = React.useCallback(
    () => ({
      engine: engine || "email",
      label: label || "",
      subject: subject || "",
      body: body || "",
    }),
    [engine, label, subject, body]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });


  const { watch } = form;
  const fieldValue = watch('body'); // Assuming 'engine' is the name of the field you're interested in

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (label && subject && body !== undefined) {
      const template = await update(id as string, values.label, values.subject, values.body)
      if (template) {
        toast.success('Template aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } else {
      const template = await create(project, values.engine, type, values.label, values.subject, values.body)
      if (template) {
        toast.success('Template aangemaakt!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    }
  }

  const [templateData, setTemplateData] = useState(initialData);
  const [mjmlHtml, setMjmlHtml] = useState('');

  let mailTemplate: any = nunjucks.renderString(templateData, context);

  async function convertMJMLToHTML(data = mailTemplate) {
    const mjml2html = (await import('mjml-browser')).default;
    const htmlOutput = mjml2html(data).html;
    setMjmlHtml(htmlOutput);
  }

  useEffect(() => {
    convertMJMLToHTML();
  }, []);

  const handleOnChange = (e: any, field: any) => {
    if (e.target.value.length > 0) {
      convertMJMLToHTML(nunjucks.renderString(e.target.value, context));
    }
  }

  useEffect(() => {
    if (fieldValue) {
      convertMJMLToHTML(nunjucks.renderString(fieldValue, context));
    }
  }, [fieldValue]);

  return (
    <div>
      <div className="container px-0 py-6">
        <Form {...form} className="px-0 py-6 bg-white rounded-md">
          <Heading size="xl">{notificationTitle}</Heading>
          <Separator className="my-4" />
          <div className="grid grid-cols-2">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4">
              {label && subject && body !== undefined ? null :
                <FormField
                  control={form.control}
                  name="engine"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>
                        Wat voor client gaat gebruikt worden voor dit onderdeel?
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="email" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">
                            Email
                          </SelectItem>
                          <SelectItem value="sms">
                            SMS
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              }
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label (Type bericht)</FormLabel>
                    <FormControl>
                      <Input placeholder="Label van de mail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Onderwerp</FormLabel>
                    <FormControl>
                      <Input placeholder="Onderwerp van de mail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inhoud</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Inhoud van de mail..."
                        defaultValue={field.value.length > 0 ? field.value : initialData}
                        rows={20}
                        onKeyUpCapture={(e) => handleOnChange(e, field)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Opslaan</Button>
            </form>
            {notificationTitle === 'Inloggen via e-mail' && (
              <div className="p-4">
                <iframe className='email-iframe' srcDoc={mjmlHtml} height={500} width={500}></iframe>
              </div>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
