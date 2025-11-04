import { Link } from "react-router-dom";
import { Calendar, User, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: {
    name: string;
    photo?: string;
  };
  date: string;
  type: "article" | "news";
}

export const ArticleCard = ({
  id,
  title,
  excerpt,
  coverImage,
  author,
  date,
  type,
}: ArticleCardProps) => {
  const formattedDate = new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const link = type === "article" ? `/articles/${id}` : `/news/${id}`;

  const badgeText = type === "article" ? "مقالة" : "خبر";
  const badgeColor = type === "article" ? "bg-secondary" : "bg-primary";

  return (
    <Link to={link}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full group border-0">
        <div className="relative overflow-hidden aspect-video">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <Badge className={`absolute top-3 right-3 ${badgeColor} text-white border-0`}>
            <Star className="w-3 h-3 ml-1" />
            {badgeText}
          </Badge>
        </div>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{author.name}</span>
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarImage src={author.photo} alt={author.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};