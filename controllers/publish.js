const { connect, StringCodec, consumerOpts } = require("nats");

module.exports = async function (body) {
    try {
        // 连接 nats
        console.log(body.data, `${NATS_SERVER}:${NATS_PORT}`)
        await Publish(body.data);
        return "Success"
    } catch (error) {
        console.error(error);
        res.statusCode = 500;
        return error.toString("utf8")

    } finally {
    }

    async function Publish(data) {
        // to create a connection to a nats-server:
        const nc = await connect({ servers: `${global.NATS_SERVER}:${global.NATS_PORT}` });
        // create a codec
        const sc = StringCodec();

        // 此处需要 字符串格式
        nc.publish("xboard", sc.encode(JSON.stringify(data)));

        await nc.drain();
    }
}