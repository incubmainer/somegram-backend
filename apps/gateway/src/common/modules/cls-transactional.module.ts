// @Module({
//   imports: [
//     ClsModule.forRoot({
//       plugins: [
//         new ClsPluginTransactional({
//           imports: [GatewayPrismaModule],
//           adapter: new TransactionalAdapterPrisma({
//             prismaInjectionToken: GatewayPrismaServiceToken,
//           }),
//         }),
//       ],
//     }),
//   ],
//   exports: [ClsModule],
// })
// export class ClsTransactionalModule {}
