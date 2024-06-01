const { connect, StringCodec, consumerOpts } = require("nats");

module.exports = async function (body) {
    try {
        // console.log(body.data, `${NATS_SERVER}:${NATS_PORT}`)
        
        let result = await Publish(body.data);
        return {
            code: 200,
            msg: "Success",
            data: result
        }
    } catch (error) {
        res.statusCode = 500;
        return {
            code: 500,
            msg: "发布失败",
            data: error
        }

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