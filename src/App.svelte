<script lang="ts">
  // @ts-ignore
  import { Router, Route, Link } from "svelte-navigator";
  import Home from "./lib/pages/Home.svelte"
  import Login from "./lib/pages/Login.svelte"
  import Signup from "./lib/pages/Signup.svelte"
  import Send from "./lib/pages/Send.svelte"
  import Counter from "./lib/Counter.svelte"
</script>

<main class="font-Inter">
  <Router>
    <Route path="/">
      <Home />
    </Route>
    <Route path="/login">
      <Login />
    </Route>
    <Route path="/signup">
      <Signup />
    </Route>
    <Route path="*">
      <h1>404 - Not Found</h1>
    </Route>
    <!-- protected route -->
    <Route path="/send" >
      <Send />
    </Route>
  </Router>

</main>


