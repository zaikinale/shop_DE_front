

export default function ProductCard ({data}) {
    return (    
        <div className="card">
            <img className="card__img" src={data.img} alt={data.name} />
            <div className="card__content">
                <div className="content__desc">
                    <h3 className="desc__title">`{data.manufacturer_name} | {data.name}`</h3> 
                    <p className="desc__category">`Категория: {}`</p>
                    <p className="desc__quantity">`Количество: {}`</p>
                    <p className="desc__composition">`Состав: {}`</p>
                </div>
                <div className="content__price">
                    <p className="price__old">data.base_price</p>
                    <p className="price__now"></p>
                    <p className="price__discount"></p>      
                </div>
            </div>
        </div>
    )
}