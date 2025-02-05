﻿using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;

namespace SecurityService.SSO.Infrastructure.Configuration
{
	internal static class Certificate
	{
		public static X509Certificate2 LoadCertificate()
		{
			return new X509Certificate2(
				string.Format(@"{0}\Infrastructure\Configuration\idsrv3test.pfx", AppDomain.CurrentDomain.BaseDirectory), "idsrv3test");
		}

		private static byte[] ReadStream(Stream input)
		{
			byte[] buffer = new byte[16 * 1024];
			using (MemoryStream ms = new MemoryStream())
			{
				int read;
				while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
				{
					ms.Write(buffer, 0, read);
				}
				return ms.ToArray();
			}
		}
	}
}