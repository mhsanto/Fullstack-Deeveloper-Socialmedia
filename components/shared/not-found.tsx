import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
type NotFoundPageProps = {
  href: string;
  title: string;
  body?: string;
  linkText: string;
};
const NotFoundPage = ({ href, title, body, linkText }: NotFoundPageProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center h-full mt-1 gap-4">
      <div className="overflow-hidden rounded">
        <Image
          src="/assets/icons/404.gif"
          width={300}
          height={150}
          alt="404 page"
          className="object-cover aspect[300/150]"
        />
      </div>
      <div className="flex flex-col gap-2 items-center">
        <h3 className="h3-bold dark:text-white ">{title}</h3>
        <p className=" paragraph text-dark500_light700 max-w-md text-center">
          {body}
        </p>
        <Link href={href} className="bg-primary-500/80 rounded-md text-light-900 ">
          <Button>{linkText}</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
