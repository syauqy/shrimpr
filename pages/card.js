import React from "react";
import { PageLayout } from "@/components/layouts/page";
import { PageContent } from "@/components/layouts/page-content";
import Container from "@/components/layouts/container";

export default function Card() {
  return (
    <PageLayout>
      <PageContent>
        <Container className="px-4 space-y-5">Card</Container>
      </PageContent>
    </PageLayout>
  );
}
