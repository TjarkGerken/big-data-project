"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  spotifyUser: z.string({
    required_error: "Please select a dataset to analyse.",
  }),
});

interface DataRequestFormProps {
  disabled?: boolean;
}

export default function DataRequestForm({
  disabled = false,
}: DataRequestFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const router = useRouter();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const uid = data.spotifyUser;
    if (uid) {
      router.push(`/results?uid=${uid}`);
    }
  }
  return (
    <div className={"text-white w-full flex flex-col space-y-4"}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <FormField
            control={form.control}
            name="spotifyUser"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={"text-xl"}>Spotify Users</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={"text-xl"}>
                      <SelectValue placeholder="Select a User" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={"text-xl"}>
                    <SelectItem value="carlos">Carlos</SelectItem>
                    <SelectItem value="niklas">Niklas</SelectItem>
                    <SelectItem value="david">David</SelectItem>
                    <SelectItem value="tjark">Tjark</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          {disabled && (
            <p>
              You must be authenticated with Spotify to access this feature.
            </p>
          )}
          <Button
            type="submit"
            disabled={disabled || !form.formState.isValid}
            className={
              "bg-spotify-green w-full text-spotify-black rounded-full px-8 py-4 text-center font-bold text-xl"
            }
          >
            Analyse Data
          </Button>
        </form>
      </Form>
    </div>
  );
}
