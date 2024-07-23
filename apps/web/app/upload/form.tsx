"use client";

import { Button } from "@repo/ui/src/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/src/form";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getErrorMessage } from "../lib/handle-errors";
import { FileUploader } from "./file-uploader";

import { useUploadFile } from "@repo/ui/hooks/use-upload-file";
import { UploadedFilesCard } from "./uploaded-files-card";

const schema = z.object({
	images: z.array(z.instanceof(File)),
});

type Schema = z.infer<typeof schema>;

export function UploadForm() {
	const [loading, setLoading] = React.useState(false);
	const { uploadFiles, uploadedFiles, isUploading } = useUploadFile(
		"imageUploader",
		{ defaultUploadedFiles: [] },
	);
	const form = useForm<Schema>({
		resolver: zodResolver(schema),
		defaultValues: {
			images: [],
		},
	});

	function onSubmit(input: Schema) {
		setLoading(true);

		toast.promise(uploadFiles(input.images), {
			loading: "Uploading images...",
			success: () => {
				form.reset();
				setLoading(false);
				return "Images uploaded";
			},
			error: (err) => {
				setLoading(false);
				return getErrorMessage(err);
			},
		});
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex max-w-2xl flex-col gap-6 w-full"
			>
				<FormField
					control={form.control}
					name="images"
					render={({ field }) => (
						<div className="space-y-6">
							<FormItem className="w-full">
								<FormLabel>Images</FormLabel>
								<FormControl>
									<FileUploader
										value={field.value}
										onValueChange={field.onChange}
										maxFiles={4}
										maxSize={4 * 1024 * 1024}
										onUpload={uploadFiles}
										disabled={isUploading}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
							{uploadedFiles.length > 0 ? (
								<UploadedFilesCard uploadedFiles={uploadedFiles} />
							) : null}
						</div>
					)}
				/>
				<Button className="w-fit" disabled={loading}>
					Save
				</Button>
			</form>
		</Form>
	);
}
