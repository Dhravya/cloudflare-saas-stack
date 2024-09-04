import { redirect } from "next/navigation";
import { auth } from "../server/auth";
import { UploadForm } from "./form";

export const runtime = "edge";

import { Button } from "@repo/ui/src/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/src/form";
import { getErrorMessage } from "../lib/handle-errors";
import { FileUploader } from "./file-uploader";

import { useUploadFile } from "@repo/ui/hooks/use-upload-file";
import { UploadedFilesCard } from "./uploaded-files-card";

const schema = typeof window !== "undefined" ? z.object({
images: z.array(z.instanceof(File)),
}) : z.object({
images: z.array(z.any()),
const schema = z.object({
  images: z.array(z.instanceof(File)),
});

type Schema = z.infer<typeof schema>;

export default function ReactHookFormDemo() {
  const [loading, setLoading] = React.useState(false);
  const { uploadFiles, uploadedFiles, isUploading } = useUploadFile(
    "imageUploader",
    { defaultUploadedFiles: [] }
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
    <div className="flex flex-col w-full min-h-screen items-center justify-center">
      <div>
        To enable file uploading, add the following env variables to
        `apps/web/.dev.vars`
        <pre className="text-sm">
          <code>
            {`R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
R2_ACCESS_ID=your-access-id 
R2_SECRET_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
`}
          </code>
        </pre>
        Also for local developement, edit your cors policy in settings of R2 as
        following
        <pre>
          <code>
            {`
[
  {
    "AllowedOrigins": [
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
    `}
          </code>
        </pre>
      </div>

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
    </div>
  );
}
