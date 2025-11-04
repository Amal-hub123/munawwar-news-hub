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
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0">
        <div className="flex flex-row-reverse gap-4 p-4">
         
          
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                {excerpt}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-3 mt-auto">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarImage src={author.photo} alt={author.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">{author.name}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
            </div>

 <div className="relative flex-shrink-0 w-48 h-48 overflow-hidden rounded-lg">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <Badge className={`absolute top-2 right-2 ${badgeColor} text-white border-0`}>
              <Star className="w-3 h-3 ml-1" />
              {badgeText}
            </Badge>
          </div>
            
          </div>
        </div>
      </Card>
    </Link>
  );
};
