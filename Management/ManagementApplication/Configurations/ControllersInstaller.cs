﻿using Castle.MicroKernel.Registration;
using Castle.MicroKernel.SubSystems.Configuration;
using Castle.Windsor;

namespace ManagementApplication.Configurations
{
	public class ControllersInstaller : IWindsorInstaller
	{
		public void Install(IWindsorContainer container, IConfigurationStore store)
		{
			container.Register(Classes.FromThisAssembly()
				.Pick().If(t => t.Name.EndsWith("Controller"))
				.Configure(configurer => configurer.Named(configurer.Implementation.Name))
				.LifestylePerWebRequest());
		}
	}
}