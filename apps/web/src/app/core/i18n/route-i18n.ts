import { RoutePageData, RoutePageKey } from '@app/core/routing/route-page-data.model';

const ROUTE_I18N: Record<
  RoutePageKey,
  {
    title: () => string;
    breadcrumb: () => string;
    description: () => string;
  }
> = {
  login: {
    title: () => $localize`:@@route.login.title:Login`,
    breadcrumb: () => $localize`:@@route.login.breadcrumb:Login`,
    description: () =>
      $localize`:@@route.login.description:Sign in to manage your tasks securely.`,
  },
  register: {
    title: () => $localize`:@@route.register.title:Create Account`,
    breadcrumb: () => $localize`:@@route.register.breadcrumb:Register`,
    description: () =>
      $localize`:@@route.register.description:Create a free account and start organizing your todos.`,
  },
  todos: {
    title: () => $localize`:@@route.todos.title:My Todos`,
    breadcrumb: () => $localize`:@@route.todos.breadcrumb:Todos`,
    description: () =>
      $localize`:@@route.todos.description:View and manage your personal todo list.`,
  },
  kanban: {
    title: () => $localize`:@@route.kanban.title:Kanban`,
    breadcrumb: () => $localize`:@@route.kanban.breadcrumb:Kanban`,
    description: () =>
      $localize`:@@route.kanban.description:Organize tasks on a kanban board by status.`,
  },
  calendar: {
    title: () => $localize`:@@route.calendar.title:Calendar`,
    breadcrumb: () => $localize`:@@route.calendar.breadcrumb:Calendar`,
    description: () =>
      $localize`:@@route.calendar.description:See upcoming todos and due dates on your calendar.`,
  },
  profile: {
    title: () => $localize`:@@route.profile.title:My Profile`,
    breadcrumb: () => $localize`:@@route.profile.breadcrumb:Profile`,
    description: () =>
      $localize`:@@route.profile.description:Manage your account settings and preferences.`,
  },
  rtl: {
    title: () => $localize`:@@route.rtl.title:RTL demo`,
    breadcrumb: () => $localize`:@@route.rtl.breadcrumb:RTL`,
    description: () =>
      $localize`:@@route.rtl.description:Design system layout check with dir=rtl.`,
  },
};

export function localizeRoutePage(page: RoutePageData): RoutePageData {
  if (!page.pageKey) {
    return page;
  }

  const localized = ROUTE_I18N[page.pageKey];
  if (!localized) {
    return page;
  }

  return {
    ...page,
    title: localized.title(),
    breadcrumb: localized.breadcrumb(),
    description: localized.description(),
  };
}
