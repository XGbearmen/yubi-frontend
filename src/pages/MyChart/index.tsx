
import React, {useEffect, useState} from 'react';
import {listMyChartByPageUsingPost} from "@/services/yubi/chartController";
import {Avatar, Card, List, message} from "antd";
import ReactECharts from "echarts-for-react";
import {useModel} from "@umijs/max";
import Search from "antd/es/input/Search";

/**
 * 我的图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {

  const initSearchParams={
    current:1,//默认第一页
    pageSize:4,//每页展示4条数据
  };

  const [searchParams,setSearchParams]=useState<API.ChartQueryRequest>({ ...initSearchParams});
  //定义变量存储图表数据
  const [chartList,setChartList]=useState<API.Chart[]>();
  //数据总数，类型number，默认0
  const [total,setTotal]=useState<number>(0);
  //从全局状态中获取到当前登录用户信息
  const {initialState}=useModel('@@initialState');
  const {currentUser}=initialState ??{};
  //加载状态，用来控制页面是否加载，默认正在加载
  const [loading,setLoading]=useState<boolean>(true);

  const loadData=async ()=>{
    //获取数据中。还在加载中，把loading设置为true
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPost(searchParams);
      if (res.data){
        setChartList(res.data.records ??[]);
        setTotal(res.data.total?? 0);
        if (res.data.records){
          res.data.records.forEach(data=>{
            const chartOption = JSON.parse(data.genChart??'{}');
            chartOption.title=undefined;
            data.genChart=JSON.stringify(chartOption);

          })
        }
      }else {
        message.error('获取我的图表失败');
      }

    } catch (e:any) {
      message.error('获取我的图表失败'+e.message);
    }
    setLoading(false);
  };
  //首次页面加载，触发加载数据
  useEffect(() => {
    loadData();
  }, [searchParams]);

  return (
    //把页面内容指定一个类名add-chart
    <div className="my-chart-page">
      {/*搜索框*/}
      <div>
        <Search placeholder="请输入图表名称" enterButton loading={loading} onSearch={(value)=>{
          //设置搜索条件
          setSearchParams({
          //原始搜索条件
            ...initSearchParams,
          //搜索词
            name:value,
          })
        }}/>
      </div>
      <div className="margin-16"/>
      <List
        grid={{
          gutter:16,
          xs:1,
          sm:1,
          md:1,
          lg:2,
          xl:2,
          xxl:2,
        }}
        pagination={{
          onChange: (page,pageSize) => {
            setSearchParams({
              ...searchParams,
              current:page,
              pageSize,
            })
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total:total,
        }}
        loading={loading}
        //图表数据源
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{width:'100%'}}>
              <List.Item.Meta
                //展示当前用户头像
                avatar={<Avatar src={currentUser&&currentUser.userAvatar} />}
                title={item.name}
                description={item.chartType?'图表类型'+item.chartType:undefined}
              />
              <div style={{marginBottom:16}}/>
              <p>{'分析目标'+item.goal}</p>
              <div style={{marginBottom:16}}/>
              {/*展示图表*/}
              <ReactECharts option={JSON.parse(item.genChart??'{}')}/>
            </Card>
          </List.Item>
        )}
      />
      总数：{total}
    </div>
  );
};
export default MyChartPage;
