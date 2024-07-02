"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { z } from "zod";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";

const FormSchema = z.object({
  spotifyUser: z.string({
    required_error: "Please select a dataset to analyse.",
  }),
});

interface DataRequestFormProps {
  disabled?: boolean;
}

export default function DataRequestForm({ disabled = false }: DataRequestFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const uid = data.spotifyUser
    console.log(data.spotifyUser);

    axios.get("/api/fetch-db?uid=" + uid).then((response) => {
      console.log(response);
    });
  }
  return (
    <div className={"text-white w-full"}>
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
                    <SelectItem value="carlo">Carlo</SelectItem>
                    <SelectItem value="niklas">Niklas</SelectItem>
                    <SelectItem value="david">David</SelectItem>
                    <SelectItem value="tjark">Tjark</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          { disabled &&
            <p>
              You must be authenticated with Spotify to access this feature.
            </p>
          }
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
