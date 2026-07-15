import {
  ArrowLeft,
} from "lucide-react";

import AppButton from "../components/common/AppButton";

import "./NotFoundPage.css";

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div>
        <span>404</span>

        <h1>Page not found</h1>

        <p>
          The page you are looking for
          does not exist.
        </p>

        <AppButton
          to="/"
          icon={
            <ArrowLeft size={18} />
          }
          iconPosition="left"
        >
          Go Home
        </AppButton>
      </div>
    </main>
  );
}

export default NotFoundPage;