<script>
  /**
   * TODO: Make this design not suck! It's very boring.
   */
  import { onMount } from "svelte";

  // modules
  import Storage from "../../modules/storage/storage";
  import Tracker from "../../modules/tracker/tracker";

  // components
  // import TrackerButton from "../../containers/board/tracker-button.svelte";
  import NStepper from "../../components/stepper/stepper.svelte";

  // import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  // import NItem from "../../components/list-item/list-item.svelte";
  import NText from "../../components/text/text.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import Logo from "../../components/logo/logo.svelte";

  // Slides
  import WelcomeSlide from "./slide-welcome.svelte";
  import PWASlide from "./slide-pwa-install.svelte";
  import ThemeSlide from "./slide-theme.svelte";
  import TimeFormatSlide from "./slide-time-format.svelte";
  import LocationSlide from "./slide-location.svelte";
  import StorageSlide from "./slide-storage.svelte";

  import NLayout from "../layout/layout.svelte";

  import dayjs from "dayjs";
  // Local components

  // Stores
  import { UserStore } from "../../store/user";
  import { Lang } from "../../store/lang";
  import { Browser } from "../../store/browser-store";
  import { Interact } from "../../store/interact";

  // TODO: UserSession shouldn't be in here - login should be fired by Storage.
  const UserSession = new blockstack.UserSession();

  let isMobile =
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1;

  const state = {
    ready: false,
    showMore: false,
    activeSlide: 0,
    showNext: true,
    transitioning: false,
    isTiny: false,
    redirecting: false,
    timeFormat: "is12",
    theme: UserStore.getTheme()
  };

  let slides = [WelcomeSlide];
  if (Browser.iOS() && !$Browser.pwa) {
    slides.push(PWASlide);
  }
  slides.push(ThemeSlide);
  slides.push(TimeFormatSlide);
  slides.push(LocationSlide);
  slides.push(StorageSlide);

  const methods = {
    blockstackLogin() {
      state.redirecting = true;
      UserSession.redirectToSignIn();
    },

    async next() {
      if (slides[state.activeSlide] == StorageSlide && $UserStore.storageType) {
        if ($UserStore.storageType == "local") {
          window.location.href = "/";
        } else {
          methods.blockstackLogin();
        }
      } else if (slides[state.activeSlide] == PWASlide) {
        // If nexting on the PWA Slide throw a message
        let confirmed = await Interact.confirm(
          "Are you sure?",
          "Nomie is best installed as an iOS Web App, not ran in Safari. Apple can erase data older than 7 days."
        );
        if (confirmed) {
          state.activeSlide = state.activeSlide + 1;
        }
      } else {
        if (state.activeSlide < slides.length) {
          state.activeSlide = state.activeSlide + 1;
        }
      }
    },
    back() {
      state.activeSlide = state.activeSlide - 1;
    }
  };
  onMount(() => {
    setTimeout(() => {
      if (window.document.body.offsetHeight < 640) {
        state.isTiny = true;
      }
    }, 12);
  });
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
</style>

<NLayout
  pageTitle="Privately track what and who you do."
  className="page-setup"
  showTabs={false}>
  <div slot="header" class="n-toolbar-grid container">
    <div class="left" />
    <div class="main">
      <Logo size={16} color="#CCC" />
    </div>
    <div class="right" />
  </div>
  <main slot="content" class="setup-main">
    <svelte:component this={slides[state.activeSlide]} />
  </main>
  <div class="n-toolbar-grid" slot="footer">
    {#if state.activeSlide > 0}
      <button class="btn btn-clear left " on:click={methods.back}>BACK</button>
    {/if}

    <div class="main">
      <NStepper
        steps={slides.length}
        stepClass="primary-bright"
        current={state.activeSlide} />
    </div>

    {#if (slides[state.activeSlide] == StorageSlide && $UserStore.storageType) || slides[state.activeSlide] != StorageSlide}
      {#if !state.redirecting}
        <button class="btn btn-clear right" on:click={methods.next}>
          <strong>NEXT</strong>
        </button>
      {:else}
        <button class="btn btn-clear disabled right" disabled="true">
          <strong>Redirecting...</strong>
        </button>
      {/if}
    {/if}
  </div>
</NLayout>
