﻿using IdentityServer3.Core;
using IdentityServer3.Core.Models;
using System.Collections.Generic;

namespace SecurityService.SSO.Infrastructure.Configuration
{
	public class Scopes
	{
		public static IEnumerable<Scope> Get()
		{
			return new Scope[]
			{
				 ////////////////////////
                    // identity scopes
                    ////////////////////////

                    StandardScopes.OpenId,
					StandardScopes.Profile,
					StandardScopes.Email,
					StandardScopes.Address,
					StandardScopes.OfflineAccess,
					StandardScopes.RolesAlwaysInclude,
					StandardScopes.AllClaims,

                    ////////////////////////
                    // resource scopes
                    ////////////////////////

                    new Scope
					{
						Name = "read",
						DisplayName = "Read data",
						Type = ScopeType.Resource,
						Emphasize = false,

						ScopeSecrets = new List<Secret>
						{
							new Secret("123".Sha256())
						}
					},
					new Scope
					{
						Name = "write",
						DisplayName = "Write data",
						Type = ScopeType.Resource,
						Emphasize = true,

						ScopeSecrets = new List<Secret>
						{
							new Secret("123".Sha256())
						}
					},
					new Scope{
					Name = "idmgr",
					DisplayName = "IdentityManager",
					Description = "Authorization for IdentityManager",
					Type = ScopeType.Identity,
					Claims = new List<ScopeClaim>{
						new ScopeClaim(Constants.ClaimTypes.Name),
						new ScopeClaim(Constants.ClaimTypes.Role)
					}
					},
					new Scope{
					Name = "admgr",
					DisplayName = "ClientManager",
					Description = "Authorization for ClientManager",
					Type = ScopeType.Identity,
					Claims = new List<ScopeClaim>{
						new ScopeClaim(Constants.ClaimTypes.Name),
						new ScopeClaim(Constants.ClaimTypes.Role)
					}
				},
			 };
		}
	}
}