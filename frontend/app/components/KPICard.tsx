interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  valueColor?: string;
  cardBgColor?: string;
  borderColor?: string;
  titleColor?: string;
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  iconColor,
  valueColor = "text-gray-900",
  cardBgColor = "bg-white",
  borderColor = "border-gray-200",
  titleColor = "text-gray-600",
}: KPICardProps) {
  return (
    <div
      className={`${cardBgColor} rounded-2xl border ${borderColor} p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)]`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${titleColor}`}>{title}</p>
          <p className={`text-3xl font-bold ${valueColor} mt-2`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center shadow-inner`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

