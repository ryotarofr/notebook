## Installations

- First, please submit your access rights as it is a private repository

### 1. Clone this repository

```bash
git clone https://github.com/ryotarofr/notebook.git
```

### 2. Install package locally

```
bun install
```

If you have not installed bun.👇

> https://bun.sh/

### 3. Start local server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## flag が false の時はモーダル表示する

```jsx
import React, { useState, useEffect } from "react";

const App = () => {
  const [showModal, setShowModal] = useState(true);

  const [flag, setFlag] = useState(false);

  useEffect(() => {
    if (!flag) {
      const handleBeforeUnload = (event: any) => {
        event.preventDefault();
        event.returnValue = "";
        setShowModal(true);
      };
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [flag]);

  return (
    <div>
      <h1>Home</h1>
      {showModal && <Modal onClose={() => setShowModal(false)} />}
      <a href="/next">Next Page</a>
      <button onClick={() => setFlag(true)}>フラグをtrueにする</button>
    </div>
  );
};

const Modal = ({ onClose }: any) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Modal</h2>
        <button onClick={onClose}>Close Modal</button>
      </div>
    </div>
  );
};

export default App;
```
