using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.HttpOverrides;
using System.Net.WebSockets;
using Microsoft.AspNetCore.Http;
using System.Threading;
using Backend;
using BusinessServices;
using Model;

namespace Towerise
{
    public class Startup
    {
        private WorldState _worldState;
        private ConnectionManager _connectionManager;

        public Startup(IConfiguration configuration)
        {

            Configuration = configuration;
            _worldState = new WorldState();
            _connectionManager = new ConnectionManager(_worldState);
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            var webSocketOptions = new WebSocketOptions()
            {
                KeepAliveInterval = TimeSpan.FromSeconds(120),
                ReceiveBufferSize = GlobalConfigs.PacketSize

            };
            app.UseWebSockets(webSocketOptions);
            app.Use(async (context, next) =>
            {
                try
                {
                    if (context.WebSockets.IsWebSocketRequest)
                    {

                        WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                        await _connectionManager.NewConnection(webSocket);
                        Console.WriteLine("***** SOCKET IS DONEZO *****");
                        //await Task.Factory.StartNew(async () => await _connectionManager.NewConnection(webSocket));

                    }
                    else
                    {
                        await next();
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine("request exception: " + e.Message);
                }
                
            });

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    HotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }



            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    name: "spa-fallback",
                    defaults: new { controller = "Home", action = "Index" });
            });

            
        }




        
    }
}
