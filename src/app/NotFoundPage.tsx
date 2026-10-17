import { PageHeader, ButtonLink } from '@/design/components';

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" description="This address doesn't match any page. It may have been mistyped, or the page was moved." />
      <ButtonLink to="/" variant="primary">Go to Home</ButtonLink>
    </>
  );
}
