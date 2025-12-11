export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Your Replit published URL - update this after publishing
    const REPLIT_URL = env.REPLIT_URL || 'https://my-site--isaachobson420.replit.app';
    
    const targetUrl = REPLIT_URL + url.pathname + url.search;
    
    const headers = new Headers(request.headers);
    headers.set('X-Forwarded-Host', url.host);
    
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' 
        ? request.body 
        : undefined,
      redirect: 'manual',
    });
    
    const newHeaders = new Headers(response.headers);
    newHeaders.delete('content-encoding');
    
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  }
};
