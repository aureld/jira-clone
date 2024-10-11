import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="">
      <Input />
      <Button variant="primary">
        Primary
      </Button>
      <Button variant="secondary">
        Secondary
      </Button>
      <Button variant="destructive">
        Destructive
      </Button>
      <Button variant="ghost">
      ghost
      </Button>
      <Button variant="muted">
      muted
      </Button>
      <Button variant="outline">
      outline
      </Button>
      <Button variant="tertiary">
      tertiary
      </Button>
    </div>
  );
}
