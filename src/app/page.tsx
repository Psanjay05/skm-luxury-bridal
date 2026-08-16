import PublicHomePage from "./(public)/page";
import PublicLayout from "./(public)/layout";

export default function RootPage() {
  return (
    <PublicLayout>
      <PublicHomePage />
    </PublicLayout>
  );
}

