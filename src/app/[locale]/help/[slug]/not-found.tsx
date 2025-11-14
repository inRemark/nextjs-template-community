import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Card, CardContent } from '@shared/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Article Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The help article you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="default">
              <Link href="/help">
                Back to Help Center
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
