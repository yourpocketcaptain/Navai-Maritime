export async function onRequest(context) {
    const url = new URL(context.request.url);
    const { hostname, pathname, search } = url;

    // Enforce canonical domain: Redirect *.pages.dev to navaitech.com
    if (hostname.endsWith('.pages.dev')) {
        const newUrl = `https://navaitech.com${pathname}${search}`;
        return Response.redirect(newUrl, 301);
    }

    return context.next();
}
