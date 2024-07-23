import { redirect } from "next/navigation";
import { auth } from "../server/auth";
import { UploadForm } from "./form";

export const runtime = "edge";

export default async function UploadPage() {
	const session = await auth();
	if (!session?.user) {
		return redirect("/");
	}

	return (
		<div className="flex flex-col w-full min-h-screen items-center justify-center">
			<div>
				To enable file uploading, add the following env variables to
				`apps/web/.dev.vars`
				<pre className="text-sm">
					<code>
						{`R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
R2_ACCESS_ID=your-access-id R2_SECRET_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name`}
					</code>
				</pre>
			</div>
			<UploadForm />
		</div>
	);
}
